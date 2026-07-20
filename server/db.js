import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const unavailable = async () => {
  throw new Error('DATABASE_URL não configurada no ambiente da Function.');
};
unavailable.query = unavailable;

export const sql = connectionString ? neon(connectionString) : unavailable;
export const databaseConfigured = Boolean(connectionString);

let schemaPromise;
export function ensureSchema() {
  schemaPromise ||= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS clients (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS portal_token_hash TEXT`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS clients_portal_token_hash_idx ON clients (portal_token_hash) WHERE portal_token_hash IS NOT NULL`;
    await sql`CREATE TABLE IF NOT EXISTS user_settings (
      user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      default_rate_cents INTEGER NOT NULL DEFAULT 15000,
      default_client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
      pending_carryover_cents INTEGER NOT NULL DEFAULT 0,
      pending_carryover_currency TEXT NOT NULL DEFAULT 'BRL'
    )`;
    await sql`CREATE TABLE IF NOT EXISTS services (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
      client TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      service_date TEXT NOT NULL DEFAULT '',
      service_time TEXT NOT NULL DEFAULT '',
      currency TEXT NOT NULL DEFAULT 'BRL',
      rate_cents INTEGER NOT NULL,
      carryover_cents INTEGER NOT NULL DEFAULT 0,
      discount_cents INTEGER NOT NULL DEFAULT 0,
      adjustment_type TEXT NOT NULL DEFAULT 'discount',
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS billing_type TEXT NOT NULL DEFAULT 'hourly'`;
    await sql`CREATE TABLE IF NOT EXISTS time_entries (
      id BIGSERIAL PRIMARY KEY,
      service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      work_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      minutes INTEGER NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS payments (
      id BIGSERIAL PRIMARY KEY,
      service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      amount_cents INTEGER NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      consumed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS user_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions (user_id)`;
    await sql`CREATE TABLE IF NOT EXISTS github_installations (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      installation_id BIGINT NOT NULL UNIQUE,
      account_login TEXT NOT NULL DEFAULT '',
      account_type TEXT NOT NULL DEFAULT '',
      installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS github_installations_user_installation_idx ON github_installations (user_id, installation_id)`;
    await sql`CREATE TABLE IF NOT EXISTS github_repositories (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      installation_id BIGINT NOT NULL REFERENCES github_installations(installation_id) ON DELETE CASCADE,
      github_repository_id BIGINT NOT NULL,
      full_name TEXT NOT NULL,
      owner_login TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      default_branch TEXT NOT NULL DEFAULT 'main',
      is_private BOOLEAN NOT NULL DEFAULT TRUE,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, github_repository_id)
    )`;
    await sql`CREATE TABLE IF NOT EXISTS github_commits (
      id BIGSERIAL PRIMARY KEY,
      repository_id BIGINT NOT NULL REFERENCES github_repositories(id) ON DELETE CASCADE,
      sha TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      author_name TEXT NOT NULL DEFAULT '',
      author_login TEXT NOT NULL DEFAULT '',
      committed_at TIMESTAMPTZ,
      html_url TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (repository_id, sha)
    )`;
    await sql`CREATE TABLE IF NOT EXISTS service_github_commits (
      service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      commit_id BIGINT NOT NULL REFERENCES github_commits(id) ON DELETE CASCADE,
      linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (service_id, commit_id)
    )`;
    await sql`CREATE TABLE IF NOT EXISTS service_github_repositories (
      service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      repository_id BIGINT NOT NULL REFERENCES github_repositories(id) ON DELETE CASCADE,
      linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (service_id, repository_id)
    )`;
    await sql`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS default_github_repository_id BIGINT REFERENCES github_repositories(id) ON DELETE SET NULL`;
    await sql`CREATE TABLE IF NOT EXISTS github_webhook_events (
      delivery_id TEXT PRIMARY KEY,
      event_name TEXT NOT NULL,
      installation_id BIGINT,
      received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS github_oauth_states (
      state_hash TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  })();
  return schemaPromise;
}

export function centsFromReais(value) {
  const cleaned = String(value ?? '').trim().replace(/[^\d,.-]/g, '');
  const normalized = Number(cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned);
  return Number.isFinite(normalized) && normalized >= 0 ? Math.round(normalized * 100) : null;
}

export function minutesBetween(startTime, endTime) {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export async function ensureUserSettings(userId) {
  await sql`INSERT INTO user_settings (user_id) VALUES (${userId}) ON CONFLICT (user_id) DO NOTHING`;
}

export async function getSettings(userId) {
  await ensureUserSettings(userId);
  const [settings] = await sql`SELECT * FROM user_settings WHERE user_id = ${userId}`;
  return settings;
}

export async function getClients(userId) {
  return sql`SELECT * FROM clients WHERE user_id = ${userId} ORDER BY LOWER(name), id`;
}

async function decorateService(service, userId) {
  const [clientRecord, entries, payments, githubCommits, githubRepositories] = await Promise.all([
    service.client_id
      ? sql`SELECT * FROM clients WHERE id = ${service.client_id} AND user_id = ${userId}`.then((rows) => rows[0] || null)
      : null,
    sql`SELECT * FROM time_entries WHERE service_id = ${service.id} ORDER BY work_date DESC, start_time DESC, id DESC`,
    sql`SELECT * FROM payments WHERE service_id = ${service.id} ORDER BY created_at DESC, id DESC`,
    sql`SELECT gc.*, gr.full_name AS repository_full_name FROM service_github_commits sgc JOIN github_commits gc ON gc.id=sgc.commit_id JOIN github_repositories gr ON gr.id=gc.repository_id WHERE sgc.service_id=${service.id} ORDER BY gc.committed_at DESC NULLS LAST, gc.id DESC`,
    sql`SELECT gr.* FROM service_github_repositories sgr JOIN github_repositories gr ON gr.id=sgr.repository_id WHERE sgr.service_id=${service.id} ORDER BY LOWER(gr.full_name)`
  ]);
  const workedMinutes = entries.reduce((sum, item) => sum + item.minutes, 0);
  const billingType = ['hourly', 'daily', 'fixed'].includes(service.billing_type) ? service.billing_type : 'hourly';
  const billingUnits = billingType === 'daily'
    ? new Set(entries.map((item) => item.work_date)).size
    : billingType === 'fixed' ? 1 : workedMinutes / 60;
  const paidCents = payments.reduce((sum, item) => sum + item.amount_cents, 0);
  const baseCents = billingType === 'fixed' || billingType === 'daily'
    ? Math.round(billingUnits * service.rate_cents)
    : Math.round((workedMinutes / 60) * service.rate_cents);
  const grossCents = baseCents + service.carryover_cents;
  const adjustmentCents = service.discount_cents || 0;
  const adjustmentType = service.adjustment_type === 'surcharge' ? 'surcharge' : 'discount';
  const totalCents = Math.max(
    adjustmentType === 'surcharge'
      ? grossCents + adjustmentCents
      : grossCents - adjustmentCents,
    0
  );
  return {
    ...service,
    clientRecord,
    entries,
    payments,
    githubCommits,
    githubRepositories,
    workedMinutes,
    hoursCents: baseCents,
    baseCents,
    billingType,
    billingUnits,
    grossCents,
    adjustmentCents,
    adjustmentType,
    totalCents,
    paidCents,
    balanceCents: Math.max(totalCents - paidCents, 0)
  };
}

export async function getServices(userId) {
  const services = await sql`SELECT * FROM services WHERE user_id = ${userId} ORDER BY service_date DESC, service_time DESC, id DESC`;
  return Promise.all(services.map((service) => decorateService(service, userId)));
}

export async function getService(id, userId) {
  const [service] = await sql`SELECT * FROM services WHERE id = ${id} AND user_id = ${userId}`;
  return service ? decorateService(service, userId) : null;
}

export async function getClientPortal(tokenHash) {
  const [client] = await sql`SELECT id,name FROM clients WHERE portal_token_hash=${tokenHash}`;
  if (!client) return null;
  const services = await sql`SELECT * FROM services WHERE client_id=${client.id} ORDER BY service_date DESC,service_time DESC,id DESC`;
  const decorated = await Promise.all(services.map((service) => decorateService(service, service.user_id)));
  const totals = decorated.reduce((result, service) => {
    result[service.currency] ||= { totalCents: 0, paidCents: 0, balanceCents: 0 };
    result[service.currency].totalCents += service.totalCents;
    result[service.currency].paidCents += service.paidCents;
    if (service.status !== 'transferred') result[service.currency].balanceCents += service.balanceCents;
    return result;
  }, {});
  return { client: { name: client.name }, totals, services: decorated };
}

export async function updateComputedStatus(serviceId, userId) {
  const service = await getService(serviceId, userId);
  if (!service || service.status === 'transferred') return;
  const status = service.balanceCents <= 0 && service.totalCents > 0 ? 'paid' : 'open';
  await sql`UPDATE services SET status = ${status} WHERE id = ${serviceId} AND user_id = ${userId}`;
}
