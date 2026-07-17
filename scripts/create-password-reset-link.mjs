import crypto from 'node:crypto';
import { ensureSchema, sql } from '../server/db.js';

const [email, baseUrl] = process.argv.slice(2);
if (!email || !baseUrl) throw new Error('Uso: node create-password-reset-link.mjs <email> <base-url>');

await ensureSchema();
const [user] = await sql`SELECT id FROM users WHERE email=${email.toLowerCase()}`;
if (!user) throw new Error('Usuário não encontrado.');

const token = crypto.randomBytes(32).toString('base64url');
const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
await sql`UPDATE password_reset_tokens SET consumed_at=NOW() WHERE user_id=${user.id} AND consumed_at IS NULL`;
await sql`INSERT INTO password_reset_tokens (user_id,token_hash,expires_at)
  VALUES (${user.id},${tokenHash},NOW() + INTERVAL '1 hour')`;

console.log(`${baseUrl.replace(/\/$/, '')}/?reset_token=${encodeURIComponent(token)}`);
