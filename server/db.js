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
  const [clientRecord, entries, payments] = await Promise.all([
    service.client_id
      ? sql`SELECT * FROM clients WHERE id = ${service.client_id} AND user_id = ${userId}`.then((rows) => rows[0] || null)
      : null,
    sql`SELECT * FROM time_entries WHERE service_id = ${service.id} ORDER BY work_date DESC, start_time DESC, id DESC`,
    sql`SELECT * FROM payments WHERE service_id = ${service.id} ORDER BY created_at DESC, id DESC`
  ]);
  const workedMinutes = entries.reduce((sum, item) => sum + item.minutes, 0);
  const paidCents = payments.reduce((sum, item) => sum + item.amount_cents, 0);
  const grossCents = Math.round((workedMinutes / 60) * service.rate_cents) + service.carryover_cents;
  const totalCents = Math.max(
    service.adjustment_type === 'surcharge'
      ? grossCents + service.discount_cents
      : grossCents - service.discount_cents,
    0
  );
  return {
    ...service,
    clientRecord,
    entries,
    payments,
    workedMinutes,
    grossCents,
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
