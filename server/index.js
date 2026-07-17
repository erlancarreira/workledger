import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  centsFromReais, databaseConfigured, ensureSchema, ensureUserSettings, getClientPortal, getClients, getService,
  getServices, getSettings, minutesBetween, sql, updateComputedStatus
} from './db.js';
import { getInstallation, getInstallationRepositories, getRepositoryCommits, getUserInstallations, githubConfigured, githubOAuthConfigured, installationUrl, oauthAuthorizationUrl, verifyWebhook } from './github.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

function callbackBaseUrl(req) {
  return process.env.GITHUB_CALLBACK_URL?.replace(/\/api\/github\/callback$/, '') || `${req.protocol}://${req.get('host')}`;
}
function oauthCallbackUrl(req) {
  return process.env.GITHUB_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/github/callback`;
}

async function storeRepositoryCommits(repositoryId, commits) {
  for (const commit of commits) {
    const message = String(commit.commit?.message || '').split('\n')[0].slice(0, 500);
    await sql`INSERT INTO github_commits (repository_id,sha,message,author_name,author_login,committed_at,html_url)
      VALUES (${repositoryId},${commit.sha},${message},${String(commit.commit?.author?.name || '')},${String(commit.author?.login || '')},${commit.commit?.author?.date || null},${String(commit.html_url || '')})
      ON CONFLICT (repository_id,sha) DO UPDATE SET message=EXCLUDED.message,author_name=EXCLUDED.author_name,author_login=EXCLUDED.author_login,committed_at=EXCLUDED.committed_at,html_url=EXCLUDED.html_url`;
  }
}

async function syncInstallationRepositories(userId, installationId) {
  const installation = await getInstallation(installationId);
  const repositories = await getInstallationRepositories(installationId);
  await sql`INSERT INTO github_installations (user_id,installation_id,account_login,account_type,updated_at)
    VALUES (${userId},${installationId},${String(installation.account?.login || '')},${String(installation.account?.type || '')},NOW())
    ON CONFLICT (installation_id) DO UPDATE SET user_id=EXCLUDED.user_id,account_login=EXCLUDED.account_login,account_type=EXCLUDED.account_type,updated_at=NOW()`;
  for (const repository of repositories) {
    await sql`INSERT INTO github_repositories (user_id,installation_id,github_repository_id,full_name,owner_login,name,default_branch,is_private,active,updated_at)
      VALUES (${userId},${installationId},${repository.id},${repository.full_name},${String(repository.owner?.login || '')},${repository.name},${repository.default_branch || 'main'},${Boolean(repository.private)},true,NOW())
      ON CONFLICT (user_id,github_repository_id) DO UPDATE SET installation_id=EXCLUDED.installation_id,full_name=EXCLUDED.full_name,owner_login=EXCLUDED.owner_login,name=EXCLUDED.name,default_branch=EXCLUDED.default_branch,is_private=EXCLUDED.is_private,active=true,updated_at=NOW()`;
  }
  return repositories.length;
}

app.post('/api/github/webhook', express.raw({ type: 'application/json' }), asyncRoute(async (req, res) => {
  const rawBody = req.body;
  if (!Buffer.isBuffer(rawBody) || !verifyWebhook(rawBody, req.header('x-hub-signature-256'))) return res.status(401).json({ error: 'Assinatura do webhook inválida.' });
  await ensureSchema();
  const deliveryId = String(req.header('x-github-delivery') || '');
  const eventName = String(req.header('x-github-event') || '');
  if (!deliveryId) return res.status(400).json({ error: 'Entrega do GitHub inválida.' });
  const payload = JSON.parse(rawBody.toString('utf8'));
  const installationId = Number(payload.installation?.id) || null;
  const inserted = await sql`INSERT INTO github_webhook_events (delivery_id,event_name,installation_id) VALUES (${deliveryId},${eventName},${installationId}) ON CONFLICT (delivery_id) DO NOTHING RETURNING delivery_id`;
  if (!inserted[0]) return res.status(202).json({ ok: true, duplicate: true });
  if (eventName === 'push' && payload.repository?.id && installationId) {
    const repositories = await sql`SELECT id FROM github_repositories WHERE github_repository_id=${Number(payload.repository.id)} AND installation_id=${installationId} AND active=true`;
    const commits = Array.isArray(payload.commits) ? payload.commits.map((commit) => ({
      sha: commit.id,
      commit: { message: commit.message, author: { name: commit.author?.name, date: commit.timestamp } },
      author: { login: commit.author?.username || '' },
      html_url: `${payload.repository.html_url}/commit/${commit.id}`
    })) : [];
    await Promise.all(repositories.map((repository) => storeRepositoryCommits(repository.id, commits)));
  }
  res.status(202).json({ ok: true });
}));
app.use(express.json());
app.get('/api/health', asyncRoute(async (_req, res) => {
  if (!databaseConfigured) return res.status(503).json({ ok: false, code: 'DATABASE_URL_MISSING' });
  await ensureSchema();
  await sql`SELECT 1`;
  res.json({ ok: true, database: 'connected' });
}));
app.use(async (_req, _res, next) => {
  try { await ensureSchema(); next(); } catch (error) { next(error); }
});
app.get('/api/public/client/:token', asyncRoute(async (req, res) => {
  const tokenHash = crypto.createHash('sha256').update(String(req.params.token || '')).digest('hex');
  const portal = await getClientPortal(tokenHash);
  if (!portal) return res.status(404).json({ error: 'Link inválido ou desativado.' });
  res.set('Cache-Control', 'no-store');
  res.json(portal);
}));
app.get('/api/github/callback', asyncRoute(async (req, res) => {
  const state = String(req.query.state || ''), code = String(req.query.code || '');
  const home = callbackBaseUrl(req);
  if (!state || !code) return res.redirect(302, `${home}/?github_error=authorization`);
  await ensureSchema();
  const stateHash = crypto.createHash('sha256').update(state).digest('hex');
  const rows = await sql`DELETE FROM github_oauth_states WHERE state_hash=${stateHash} AND expires_at > NOW() RETURNING user_id`;
  if (!rows[0]) return res.redirect(302, `${home}/?github_error=authorization`);
  try {
    const installations = await getUserInstallations(code, oauthCallbackUrl(req));
    let repositoryCount = 0;
    for (const installation of installations) {
      if (!installation.suspended_at) repositoryCount += await syncInstallationRepositories(rows[0].user_id, installation.id);
    }
    res.redirect(302, `${home}/?github_connected=${repositoryCount}`);
  } catch (error) {
    console.error('Falha ao conectar GitHub:', error.message);
    res.redirect(302, `${home}/?github_error=connection`);
  }
}));
app.get('/api/github/setup', (req, res) => {
  const installationId = Number(req.query.installation_id);
  if (!Number.isInteger(installationId) || installationId <= 0) return res.redirect(302, callbackBaseUrl(req));
  res.redirect(302, `${callbackBaseUrl(req)}/?github_installation_id=${encodeURIComponent(installationId)}`);
});

const publicUser = ({ id, name, email }) => ({ id, name, email });
const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => ({
  salt, hash: crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex')
});
const currency = (value) => ['BRL', 'USD'].includes(String(value).toUpperCase()) ? String(value).toUpperCase() : null;
const adjustment = (value) => ['discount', 'surcharge'].includes(value || 'discount') ? (value || 'discount') : null;
const billingType = (value) => ['hourly', 'daily', 'fixed'].includes(value || 'hourly') ? (value || 'hourly') : null;
const formatTitle = (date) => {
  const [y, m, d] = date.split('-');
  return `Serviço ${y && m && d ? `${d}/${m}/${y}` : date}`;
};

async function dashboardPayload(userId) {
  const [settings, clients, services] = await Promise.all([getSettings(userId), getClients(userId), getServices(userId)]);
  const totals = services.reduce((acc, service) => {
    acc.workedMinutes += service.workedMinutes;
    acc.byCurrency[service.currency] ||= { totalCents: 0, paidCents: 0, openCents: 0 };
    acc.byCurrency[service.currency].totalCents += service.totalCents;
    acc.byCurrency[service.currency].paidCents += service.paidCents;
    if (service.status !== 'transferred') acc.byCurrency[service.currency].openCents += service.balanceCents;
    return acc;
  }, { workedMinutes: 0, byCurrency: { BRL: { totalCents: 0, paidCents: 0, openCents: 0 }, USD: { totalCents: 0, paidCents: 0, openCents: 0 } } });
  return { settings, clients, services, totals };
}

const requireUser = asyncRoute(async (req, res, next) => {
  const userId = Number(req.header('x-user-id'));
  if (!Number.isInteger(userId) || userId <= 0) return res.status(401).json({ error: 'Login necessário.' });
  const [user] = await sql`SELECT id, name, email FROM users WHERE id = ${userId}`;
  if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });
  req.user = user; next();
});
const requireService = asyncRoute(async (req, res, next) => {
  req.service = await getService(Number(req.params.id), req.user.id);
  if (!req.service) return res.status(404).json({ error: 'Serviço não encontrado.' });
  next();
});
const userClient = async (id, userId) => {
  if (!id) return null;
  const [client] = await sql`SELECT * FROM clients WHERE id = ${Number(id)} AND user_id = ${userId}`;
  return client || null;
};

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const name = String(req.body.name || '').trim(), email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!name || !email || password.length < 6) return res.status(400).json({ error: 'Informe nome, e-mail e senha com pelo menos 6 caracteres.' });
  if ((await sql`SELECT id FROM users WHERE email = ${email}`)[0]) return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
  const { hash, salt } = hashPassword(password);
  const [user] = await sql`INSERT INTO users (name,email,password_hash,password_salt) VALUES (${name},${email},${hash},${salt}) RETURNING id,name,email`;
  await ensureUserSettings(user.id);
  res.status(201).json({ user: publicUser(user) });
}));
app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase(), password = String(req.body.password || '');
  const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
  if (!user || hashPassword(password, user.password_salt).hash !== user.password_hash) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  res.json({ user: publicUser(user) });
}));
app.post('/api/auth/recover', asyncRoute(async (req, res) => {
  const token = String(req.body.token || ''), password = String(req.body.password || '');
  if (!token || password.length < 6) return res.status(400).json({ error: 'Link inválido ou senha com menos de 6 caracteres.' });
  const { hash, salt } = hashPassword(password);
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const rows = await sql`
    WITH consumed AS (
      UPDATE password_reset_tokens
      SET consumed_at = NOW()
      WHERE token_hash = ${tokenHash} AND consumed_at IS NULL AND expires_at > NOW()
      RETURNING user_id
    )
    UPDATE users SET password_hash=${hash}, password_salt=${salt}
    FROM consumed WHERE users.id=consumed.user_id
    RETURNING users.id,users.name,users.email`;
  if (!rows[0]) return res.status(400).json({ error: 'Este link é inválido, expirou ou já foi utilizado.' });
  res.json({ user: publicUser(rows[0]) });
}));

app.use('/api', requireUser);
app.get('/api/dashboard', asyncRoute(async (req, res) => res.json(await dashboardPayload(req.user.id))));
app.get('/api/github/status', asyncRoute(async (req, res) => {
  const installations = await sql`SELECT installation_id,account_login,account_type,installed_at,updated_at FROM github_installations WHERE user_id=${req.user.id} ORDER BY updated_at DESC`;
  const repositories = await sql`SELECT id,installation_id,full_name,name,default_branch,is_private,active,updated_at FROM github_repositories WHERE user_id=${req.user.id} AND active=true ORDER BY LOWER(full_name)`;
  res.json({ configured: githubConfigured(), oauthConfigured: githubOAuthConfigured(), installationUrl: githubConfigured() ? installationUrl() : null, installations, repositories });
}));
app.get('/api/github/connect', asyncRoute(async (req, res) => {
  if (!githubConfigured() || !githubOAuthConfigured()) return res.status(503).json({ error: 'A integração GitHub precisa de GITHUB_APP_ID, GITHUB_APP_SLUG, chave privada, GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET.' });
  const state = crypto.randomBytes(32).toString('base64url');
  const stateHash = crypto.createHash('sha256').update(state).digest('hex');
  await sql`DELETE FROM github_oauth_states WHERE expires_at <= NOW()`;
  await sql`INSERT INTO github_oauth_states (state_hash,user_id,expires_at) VALUES (${stateHash},${req.user.id},NOW() + INTERVAL '10 minutes')`;
  res.json({ url: oauthAuthorizationUrl(state, oauthCallbackUrl(req)) });
}));
app.post('/api/github/installations/attach', asyncRoute(async (req, res) => {
  if (!githubConfigured()) return res.status(503).json({ error: 'A integração GitHub ainda não está configurada no ambiente.' });
  const installationId = Number(req.body.installationId);
  if (!Number.isInteger(installationId) || installationId <= 0) return res.status(400).json({ error: 'Instalação GitHub inválida.' });
  const repositoryCount = await syncInstallationRepositories(req.user.id, installationId);
  res.json({ ok: true, repositoryCount });
}));
app.post('/api/github/repositories/:id/sync', asyncRoute(async (req, res) => {
  if (!githubConfigured()) return res.status(503).json({ error: 'A integração GitHub ainda não está configurada no ambiente.' });
  const [repository] = await sql`SELECT * FROM github_repositories WHERE id=${Number(req.params.id)} AND user_id=${req.user.id} AND active=true`;
  if (!repository) return res.status(404).json({ error: 'Repositório não encontrado.' });
  const commits = await getRepositoryCommits(repository.installation_id, repository.full_name);
  await storeRepositoryCommits(repository.id, commits);
  res.json({ ok: true, commits: commits.length });
}));
app.get('/api/github/repositories/:id/commits', asyncRoute(async (req, res) => {
  const [repository] = await sql`SELECT id FROM github_repositories WHERE id=${Number(req.params.id)} AND user_id=${req.user.id} AND active=true`;
  if (!repository) return res.status(404).json({ error: 'Repositório não encontrado.' });
  const commits = await sql`SELECT * FROM github_commits WHERE repository_id=${repository.id} ORDER BY committed_at DESC NULLS LAST,id DESC LIMIT 30`;
  res.json({ commits });
}));
app.patch('/api/settings', asyncRoute(async (req, res) => {
  const current = await getSettings(req.user.id);
  const rate = req.body.defaultRate === undefined ? current.default_rate_cents : centsFromReais(req.body.defaultRate);
  const clientId = req.body.defaultClientId === undefined ? current.default_client_id : (req.body.defaultClientId ? Number(req.body.defaultClientId) : null);
  if (!Number.isInteger(rate) || rate <= 0) return res.status(400).json({ error: 'Informe um valor de hora válido.' });
  if (clientId && !(await userClient(clientId, req.user.id))) return res.status(400).json({ error: 'Cliente padrão inválido.' });
  await sql`UPDATE user_settings SET default_rate_cents=${rate}, default_client_id=${clientId} WHERE user_id=${req.user.id}`;
  res.json(await dashboardPayload(req.user.id));
}));
app.post('/api/clients', asyncRoute(async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Informe o nome do cliente.' });
  await sql`INSERT INTO clients (user_id,name,notes) VALUES (${req.user.id},${name},${String(req.body.notes || '').trim()})`;
  res.status(201).json(await dashboardPayload(req.user.id));
}));
app.patch('/api/clients/:id', asyncRoute(async (req, res) => {
  const id = Number(req.params.id), name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Informe o nome do cliente.' });
  const rows = await sql`UPDATE clients SET name=${name},notes=${String(req.body.notes || '').trim()} WHERE id=${id} AND user_id=${req.user.id} RETURNING id`;
  if (!rows[0]) return res.status(404).json({ error: 'Cliente não encontrado.' });
  await sql`UPDATE services SET client=${name} WHERE client_id=${id} AND user_id=${req.user.id}`;
  res.json(await dashboardPayload(req.user.id));
}));
app.post('/api/clients/:id/share-link', asyncRoute(async (req, res) => {
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const rows = await sql`UPDATE clients SET portal_token_hash=${tokenHash} WHERE id=${Number(req.params.id)} AND user_id=${req.user.id} RETURNING id`;
  if (!rows[0]) return res.status(404).json({ error: 'Cliente não encontrado.' });
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const baseUrl = productionHost ? `https://${productionHost}` : `${req.protocol}://${req.get('host')}`;
  res.json({ token, url: `${baseUrl}/?client_portal=${encodeURIComponent(token)}` });
}));
app.delete('/api/clients/:id/share-link', asyncRoute(async (req, res) => {
  const rows = await sql`UPDATE clients SET portal_token_hash=NULL WHERE id=${Number(req.params.id)} AND user_id=${req.user.id} RETURNING id`;
  if (!rows[0]) return res.status(404).json({ error: 'Cliente não encontrado.' });
  res.json({ ok: true });
}));
app.delete('/api/clients/:id', asyncRoute(async (req, res) => {
  const rows = await sql`DELETE FROM clients WHERE id=${Number(req.params.id)} AND user_id=${req.user.id} RETURNING id`;
  if (!rows[0]) return res.status(404).json({ error: 'Cliente não encontrado.' });
  res.json(await dashboardPayload(req.user.id));
}));

app.post('/api/services', asyncRoute(async (req, res) => {
  const settings = await getSettings(req.user.id);
  const date = String(req.body.serviceDate || new Date().toISOString().slice(0, 10)), time = String(req.body.serviceTime || '00:00');
  const client = await userClient(req.body.clientId, req.user.id), curr = currency(req.body.currency || settings.pending_carryover_currency || 'BRL');
  const rate = req.body.rate ? centsFromReais(req.body.rate) : settings.default_rate_cents, discount = req.body.discount ? centsFromReais(req.body.discount) : 0;
  const adj = adjustment(req.body.adjustmentType), billing = billingType(req.body.billingType);
  if (!date || !time || !curr || !rate || discount === null || !adj || !billing) return res.status(400).json({ error: 'Dados do serviço inválidos.' });
  if (settings.pending_carryover_cents > 0 && curr !== settings.pending_carryover_currency) return res.status(400).json({ error: 'O próximo serviço precisa usar a mesma moeda do saldo transferido.' });
  const [service] = await sql`INSERT INTO services (user_id,title,client_id,client,notes,service_date,service_time,currency,rate_cents,carryover_cents,discount_cents,adjustment_type,billing_type)
    VALUES (${req.user.id},${String(req.body.title || '').trim() || formatTitle(date)},${client?.id || null},${client?.name || String(req.body.client || '').trim()},${String(req.body.notes || '').trim()},${date},${time},${curr},${rate},${settings.pending_carryover_cents},${discount},${adj},${billing}) RETURNING id`;
  if (settings.pending_carryover_cents > 0) await sql`UPDATE user_settings SET pending_carryover_cents=0,pending_carryover_currency='BRL' WHERE user_id=${req.user.id}`;
  res.status(201).json({ service: await getService(service.id, req.user.id), dashboard: await dashboardPayload(req.user.id) });
}));
app.patch('/api/services/:id', requireService, asyncRoute(async (req, res) => {
  const s = req.service, date = String(req.body.serviceDate || s.service_date), time = String(req.body.serviceTime || s.service_time);
  const client = await userClient(req.body.clientId, req.user.id), curr = currency(req.body.currency || s.currency);
  const rate = centsFromReais(req.body.rate), discount = centsFromReais(req.body.discount || 0), adj = adjustment(req.body.adjustmentType || s.adjustment_type), billing = billingType(req.body.billingType || s.billing_type);
  if (!date || !time || !curr || !rate || discount === null || !adj || !billing) return res.status(400).json({ error: 'Dados do serviço inválidos.' });
  await sql`UPDATE services SET title=${String(req.body.title || '').trim() || formatTitle(date)},client_id=${client?.id || null},client=${client?.name || String(req.body.client || '').trim()},notes=${String(req.body.notes || '').trim()},service_date=${date},service_time=${time},currency=${curr},rate_cents=${rate},discount_cents=${discount},adjustment_type=${adj},billing_type=${billing} WHERE id=${s.id} AND user_id=${req.user.id}`;
  await updateComputedStatus(s.id, req.user.id);
  res.json(await dashboardPayload(req.user.id));
}));
app.patch('/api/services/:id/adjustment', requireService, asyncRoute(async (req, res) => {
  const amount = centsFromReais(req.body.amount || 0);
  const type = adjustment(req.body.adjustmentType);
  if (amount === null || amount < 0 || !type) return res.status(400).json({ error: 'Informe um ajuste válido.' });
  await sql`UPDATE services SET discount_cents=${amount},adjustment_type=${type} WHERE id=${req.service.id} AND user_id=${req.user.id}`;
  await updateComputedStatus(req.service.id, req.user.id);
  res.json(await dashboardPayload(req.user.id));
}));
app.post('/api/services/:id/github/commits', requireService, asyncRoute(async (req, res) => {
  const commitId = Number(req.body.commitId);
  const [commit] = await sql`SELECT gc.id FROM github_commits gc JOIN github_repositories gr ON gr.id=gc.repository_id JOIN service_github_repositories sgr ON sgr.repository_id=gr.id WHERE gc.id=${commitId} AND gr.user_id=${req.user.id} AND gr.active=true AND sgr.service_id=${req.service.id}`;
  if (!commit) return res.status(404).json({ error: 'Vincule o repositório a este serviço antes de adicionar seus commits.' });
  await sql`INSERT INTO service_github_commits (service_id,commit_id) VALUES (${req.service.id},${commit.id}) ON CONFLICT DO NOTHING`;
  res.json(await dashboardPayload(req.user.id));
}));
app.post('/api/services/:id/github/repositories', requireService, asyncRoute(async (req, res) => {
  const repositoryId = Number(req.body.repositoryId);
  const [repository] = await sql`SELECT id FROM github_repositories WHERE id=${repositoryId} AND user_id=${req.user.id} AND active=true`;
  if (!repository) return res.status(404).json({ error: 'Repositório não encontrado neste usuário.' });
  await sql`INSERT INTO service_github_repositories (service_id,repository_id) VALUES (${req.service.id},${repository.id}) ON CONFLICT DO NOTHING`;
  res.json(await dashboardPayload(req.user.id));
}));
app.delete('/api/services/:id/github/repositories/:repositoryId', requireService, asyncRoute(async (req, res) => {
  await sql`DELETE FROM service_github_repositories sgr USING github_repositories gr WHERE sgr.service_id=${req.service.id} AND sgr.repository_id=${Number(req.params.repositoryId)} AND gr.id=sgr.repository_id AND gr.user_id=${req.user.id}`;
  res.json(await dashboardPayload(req.user.id));
}));
app.delete('/api/services/:id/github/commits/:commitId', requireService, asyncRoute(async (req, res) => {
  await sql`DELETE FROM service_github_commits sgc USING github_commits gc, github_repositories gr WHERE sgc.service_id=${req.service.id} AND sgc.commit_id=${Number(req.params.commitId)} AND gc.id=sgc.commit_id AND gr.id=gc.repository_id AND gr.user_id=${req.user.id}`;
  res.json(await dashboardPayload(req.user.id));
}));
app.delete('/api/services/:id', requireService, asyncRoute(async (req, res) => {
  await sql`DELETE FROM services WHERE id=${req.service.id} AND user_id=${req.user.id}`;
  res.json(await dashboardPayload(req.user.id));
}));
app.post('/api/services/:id/entries', requireService, asyncRoute(async (req, res) => {
  const minutes = minutesBetween(String(req.body.startTime || ''), String(req.body.endTime || ''));
  if (!req.body.workDate || !Number.isInteger(minutes) || minutes <= 0) return res.status(400).json({ error: 'Informe data, início e fim com duração positiva.' });
  await sql`INSERT INTO time_entries (service_id,work_date,start_time,end_time,minutes,notes) VALUES (${req.service.id},${req.body.workDate},${req.body.startTime},${req.body.endTime},${minutes},${String(req.body.notes || '').trim()})`;
  await updateComputedStatus(req.service.id, req.user.id); res.status(201).json(await dashboardPayload(req.user.id));
}));
app.delete('/api/services/:id/entries/:entryId', requireService, asyncRoute(async (req, res) => {
  await sql`DELETE FROM time_entries WHERE id=${Number(req.params.entryId)} AND service_id=${req.service.id}`;
  await updateComputedStatus(req.service.id, req.user.id); res.json(await dashboardPayload(req.user.id));
}));
app.post('/api/services/:id/payments', requireService, asyncRoute(async (req, res) => {
  const amount = centsFromReais(req.body.amount), service = await getService(req.service.id, req.user.id), mode = String(req.body.mode || 'keep-open');
  if (amount === null || amount < 0 || amount > service.balanceCents) return res.status(400).json({ error: 'Informe um pagamento válido.' });
  if (amount > 0) await sql`INSERT INTO payments (service_id,amount_cents,notes) VALUES (${service.id},${amount},${String(req.body.notes || '').trim()})`;
  const updated = await getService(service.id, req.user.id);
  if (updated.balanceCents <= 0) await sql`UPDATE services SET status='paid' WHERE id=${service.id}`;
  else if (mode === 'transfer-next') {
    await sql`UPDATE user_settings SET pending_carryover_cents=pending_carryover_cents+${updated.balanceCents},pending_carryover_currency=${updated.currency} WHERE user_id=${req.user.id}`;
    await sql`UPDATE services SET status='transferred' WHERE id=${service.id}`;
  } else await sql`UPDATE services SET status='open' WHERE id=${service.id}`;
  res.status(201).json(await dashboardPayload(req.user.id));
}));

app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '..', 'dist', 'index.html')));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Erro interno. Tente novamente.' });
});

export default app;
if (!process.env.VERCEL) app.listen(Number(process.env.PORT || 5174), () => console.log('WorkLedger iniciado.'));
