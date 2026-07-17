import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  centsFromReais, ensureSchema, ensureUserSettings, getClients, getService,
  getServices, getSettings, minutesBetween, sql, updateComputedStatus
} from './db.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json());
app.use(async (_req, _res, next) => {
  try { await ensureSchema(); next(); } catch (error) { next(error); }
});

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const publicUser = ({ id, name, email }) => ({ id, name, email });
const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => ({
  salt, hash: crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex')
});
const currency = (value) => ['BRL', 'USD'].includes(String(value).toUpperCase()) ? String(value).toUpperCase() : null;
const adjustment = (value) => ['discount', 'surcharge'].includes(value || 'discount') ? (value || 'discount') : null;
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
  const email = String(req.body.email || '').trim().toLowerCase(), password = String(req.body.password || '');
  if (!email || password.length < 6) return res.status(400).json({ error: 'Informe o e-mail e a nova senha com pelo menos 6 caracteres.' });
  const { hash, salt } = hashPassword(password);
  const rows = await sql`UPDATE users SET password_hash=${hash}, password_salt=${salt} WHERE email=${email} RETURNING id,name,email`;
  if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json({ user: publicUser(rows[0]) });
}));

app.use('/api', requireUser);
app.get('/api/dashboard', asyncRoute(async (req, res) => res.json(await dashboardPayload(req.user.id))));
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
  const adj = adjustment(req.body.adjustmentType);
  if (!date || !time || !curr || !rate || discount === null || !adj) return res.status(400).json({ error: 'Dados do serviço inválidos.' });
  if (settings.pending_carryover_cents > 0 && curr !== settings.pending_carryover_currency) return res.status(400).json({ error: 'O próximo serviço precisa usar a mesma moeda do saldo transferido.' });
  const [service] = await sql`INSERT INTO services (user_id,title,client_id,client,notes,service_date,service_time,currency,rate_cents,carryover_cents,discount_cents,adjustment_type)
    VALUES (${req.user.id},${String(req.body.title || '').trim() || formatTitle(date)},${client?.id || null},${client?.name || String(req.body.client || '').trim()},${String(req.body.notes || '').trim()},${date},${time},${curr},${rate},${settings.pending_carryover_cents},${discount},${adj}) RETURNING id`;
  if (settings.pending_carryover_cents > 0) await sql`UPDATE user_settings SET pending_carryover_cents=0,pending_carryover_currency='BRL' WHERE user_id=${req.user.id}`;
  res.status(201).json({ service: await getService(service.id, req.user.id), dashboard: await dashboardPayload(req.user.id) });
}));
app.patch('/api/services/:id', requireService, asyncRoute(async (req, res) => {
  const s = req.service, date = String(req.body.serviceDate || s.service_date), time = String(req.body.serviceTime || s.service_time);
  const client = await userClient(req.body.clientId, req.user.id), curr = currency(req.body.currency || s.currency);
  const rate = centsFromReais(req.body.rate), discount = centsFromReais(req.body.discount || 0), adj = adjustment(req.body.adjustmentType || s.adjustment_type);
  if (!date || !time || !curr || !rate || discount === null || !adj) return res.status(400).json({ error: 'Dados do serviço inválidos.' });
  await sql`UPDATE services SET title=${String(req.body.title || '').trim() || formatTitle(date)},client_id=${client?.id || null},client=${client?.name || String(req.body.client || '').trim()},notes=${String(req.body.notes || '').trim()},service_date=${date},service_time=${time},currency=${curr},rate_cents=${rate},discount_cents=${discount},adjustment_type=${adj} WHERE id=${s.id} AND user_id=${req.user.id}`;
  await updateComputedStatus(s.id, req.user.id);
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
