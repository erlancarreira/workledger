import { DatabaseSync } from 'node:sqlite';
import { sql, ensureSchema } from '../server/db.js';

const sqlite = new DatabaseSync(new URL('../data.sqlite', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'), {
  readOnly: true
});
const rows = (table) => sqlite.prepare(`SELECT * FROM ${table} ORDER BY id`).all();

await ensureSchema();

const users = rows('users');
const clients = rows('clients');
const services = rows('services');
const entries = rows('time_entries');
const payments = rows('payments');
const settings = sqlite.prepare('SELECT * FROM user_settings ORDER BY user_id').all();
const legacyUserId = users.length === 1 ? users[0].id : null;

for (const item of users) {
  await sql`INSERT INTO users (id,name,email,password_hash,password_salt,created_at)
    VALUES (${item.id},${item.name},${item.email},${item.password_hash},${item.password_salt},${item.created_at})
    ON CONFLICT (id) DO NOTHING`;
}
for (const item of clients) {
  await sql`INSERT INTO clients (id,user_id,name,notes,created_at)
    VALUES (${item.id},${item.user_id || legacyUserId},${item.name},${item.notes},${item.created_at})
    ON CONFLICT (id) DO NOTHING`;
}
for (const item of settings) {
  await sql`INSERT INTO user_settings (user_id,default_rate_cents,default_client_id,pending_carryover_cents,pending_carryover_currency)
    VALUES (${item.user_id},${item.default_rate_cents},${item.default_client_id},${item.pending_carryover_cents},${item.pending_carryover_currency})
    ON CONFLICT (user_id) DO UPDATE SET
      default_rate_cents=EXCLUDED.default_rate_cents,
      default_client_id=EXCLUDED.default_client_id,
      pending_carryover_cents=EXCLUDED.pending_carryover_cents,
      pending_carryover_currency=EXCLUDED.pending_carryover_currency`;
}
for (const item of services) {
  await sql`INSERT INTO services (id,user_id,title,client_id,client,notes,service_date,service_time,currency,rate_cents,carryover_cents,discount_cents,adjustment_type,status,created_at)
    VALUES (${item.id},${item.user_id || legacyUserId},${item.title},${item.client_id},${item.client},${item.notes},${item.service_date},${item.service_time},${item.currency},${item.rate_cents},${item.carryover_cents},${item.discount_cents},${item.adjustment_type},${item.status},${item.created_at})
    ON CONFLICT (id) DO NOTHING`;
}
for (const item of entries) {
  await sql`INSERT INTO time_entries (id,service_id,work_date,start_time,end_time,minutes,notes,created_at)
    VALUES (${item.id},${item.service_id},${item.work_date},${item.start_time},${item.end_time},${item.minutes},${item.notes},${item.created_at})
    ON CONFLICT (id) DO NOTHING`;
}
for (const item of payments) {
  await sql`INSERT INTO payments (id,service_id,amount_cents,notes,created_at)
    VALUES (${item.id},${item.service_id},${item.amount_cents},${item.notes},${item.created_at})
    ON CONFLICT (id) DO NOTHING`;
}

for (const table of ['users', 'clients', 'services', 'time_entries', 'payments']) {
  await sql.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM ${table}`);
}

sqlite.close();
console.log(JSON.stringify({
  users: users.length,
  user_settings: settings.length,
  clients: clients.length,
  services: services.length,
  time_entries: entries.length,
  payments: payments.length
}));
