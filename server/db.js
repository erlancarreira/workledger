import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data.sqlite');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    default_rate_cents INTEGER NOT NULL DEFAULT 15000,
    default_client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    pending_carryover_cents INTEGER NOT NULL DEFAULT 0,
    pending_carryover_currency TEXT NOT NULL DEFAULT 'BRL'
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    default_rate_cents INTEGER NOT NULL,
    pending_carryover_cents INTEGER NOT NULL DEFAULT 0,
    pending_carryover_currency TEXT NOT NULL DEFAULT 'BRL'
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
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
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    work_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    minutes INTEGER NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

db.prepare(`
  INSERT OR IGNORE INTO settings (id, default_rate_cents, pending_carryover_cents)
  VALUES (1, 15000, 0)
`).run();

function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((item) => item.name === column)) {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
  }
}

ensureColumn('services', 'service_date', "TEXT NOT NULL DEFAULT ''");
ensureColumn('services', 'service_time', "TEXT NOT NULL DEFAULT ''");
ensureColumn('services', 'client_id', 'INTEGER REFERENCES clients(id) ON DELETE SET NULL');
ensureColumn('services', 'discount_cents', 'INTEGER NOT NULL DEFAULT 0');
ensureColumn('services', 'currency', "TEXT NOT NULL DEFAULT 'BRL'");
ensureColumn('services', 'user_id', 'INTEGER REFERENCES users(id) ON DELETE CASCADE');
ensureColumn('clients', 'user_id', 'INTEGER REFERENCES users(id) ON DELETE CASCADE');
ensureColumn('settings', 'pending_carryover_currency', "TEXT NOT NULL DEFAULT 'BRL'");
ensureColumn('user_settings', 'default_client_id', 'INTEGER REFERENCES clients(id) ON DELETE SET NULL');
ensureColumn('services', 'adjustment_type', "TEXT NOT NULL DEFAULT 'discount'");

export function centsFromReais(value) {
  const raw = String(value ?? '').trim();
  const cleaned = raw.replace(/[^\d,.-]/g, '');
  const normalizedText = cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned;
  const normalized = Number(normalizedText);
  if (!Number.isFinite(normalized) || normalized < 0) return null;
  return Math.round(normalized * 100);
}

export function minutesBetween(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  return end - start;
}

function decorateService(service, userId) {
  const clientRecord = service.client_id
    ? db.prepare('SELECT * FROM clients WHERE id = ? AND user_id = ?').get(service.client_id, userId)
    : null;

  const entries = db.prepare(`
    SELECT * FROM time_entries
    WHERE service_id = ?
    ORDER BY work_date DESC, start_time DESC, id DESC
  `).all(service.id);

  const payments = db.prepare(`
    SELECT * FROM payments
    WHERE service_id = ?
    ORDER BY created_at DESC, id DESC
  `).all(service.id);

  const workedMinutes = entries.reduce((total, entry) => total + entry.minutes, 0);
  const hoursCents = Math.round((workedMinutes / 60) * service.rate_cents);
  const paidCents = payments.reduce((total, payment) => total + payment.amount_cents, 0);
  const grossCents = hoursCents + service.carryover_cents;
  const adjustmentCents = service.discount_cents || 0;
  const adjustmentType = service.adjustment_type === 'surcharge' ? 'surcharge' : 'discount';
  const totalCents = Math.max(
    adjustmentType === 'surcharge' ? grossCents + adjustmentCents : grossCents - adjustmentCents,
    0
  );
  const balanceCents = Math.max(totalCents - paidCents, 0);

  return {
    ...service,
    entries,
    payments,
    clientRecord,
    clientName: clientRecord?.name || service.client || '',
    workedMinutes,
    hoursCents,
    grossCents,
    adjustmentCents,
    adjustmentType,
    paidCents,
    totalCents,
    balanceCents
  };
}

export function ensureUserSettings(userId) {
  db.prepare(`
    INSERT OR IGNORE INTO user_settings (user_id, default_rate_cents, pending_carryover_cents, pending_carryover_currency)
    VALUES (?, 15000, 0, 'BRL')
  `).run(userId);
}

export function getSettings(userId) {
  ensureUserSettings(userId);
  return db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
}

export function getClients(userId) {
  return db.prepare('SELECT * FROM clients WHERE user_id = ? ORDER BY name COLLATE NOCASE ASC, id ASC').all(userId);
}

export function getServices(userId) {
  return db.prepare(`
    SELECT * FROM services
    WHERE user_id = ?
    ORDER BY service_date DESC, service_time DESC, created_at DESC, id DESC
  `)
    .all(userId)
    .map((service) => decorateService(service, userId));
}

export function getService(id, userId) {
  const service = db.prepare('SELECT * FROM services WHERE id = ? AND user_id = ?').get(id, userId);
  return service ? decorateService(service, userId) : null;
}

export function updateComputedStatus(serviceId, userId) {
  const service = getService(serviceId, userId);
  if (!service) return null;
  if (service.status === 'transferred') return service;
  const nextStatus = service.balanceCents <= 0 && service.totalCents > 0 ? 'paid' : 'open';
  db.prepare('UPDATE services SET status = ? WHERE id = ? AND user_id = ?').run(nextStatus, serviceId, userId);
  return getService(serviceId, userId);
}
