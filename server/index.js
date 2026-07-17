import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  centsFromReais,
  db,
  ensureUserSettings,
  getClients,
  getService,
  getServices,
  getSettings,
  minutesBetween,
  updateComputedStatus
} from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 5174);

app.use(express.json());

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function requireUser(req, res, next) {
  const userId = Number(req.header('x-user-id'));
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(401).json({ error: 'Login necessário.' });
  }
  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });
  req.user = user;
  next();
}

function requireService(req, res, next) {
  const service = getService(Number(req.params.id), req.user.id);
  if (!service) return res.status(404).json({ error: 'Serviço não encontrado.' });
  req.service = service;
  next();
}

function dashboardPayload(userId) {
  const settings = getSettings(userId);
  const clients = getClients(userId);
  const services = getServices(userId);
  const totals = services.reduce((acc, service) => {
    acc.workedMinutes += service.workedMinutes;
    if (!acc.byCurrency[service.currency]) {
      acc.byCurrency[service.currency] = { totalCents: 0, paidCents: 0, openCents: 0 };
    }
    acc.byCurrency[service.currency].totalCents += service.totalCents;
    acc.byCurrency[service.currency].paidCents += service.paidCents;
    if (service.status !== 'transferred') {
      acc.byCurrency[service.currency].openCents += service.balanceCents;
    }
    return acc;
  }, { workedMinutes: 0, byCurrency: { BRL: { totalCents: 0, paidCents: 0, openCents: 0 }, USD: { totalCents: 0, paidCents: 0, openCents: 0 } } });

  return { settings, clients, services, totals };
}

function normalizeCurrency(value) {
  const currency = String(value || 'BRL').trim().toUpperCase();
  return ['BRL', 'USD'].includes(currency) ? currency : null;
}

function normalizeAdjustmentType(value) {
  const type = String(value || 'discount').trim();
  return ['discount', 'surcharge'].includes(type) ? type : null;
}

function resolveClient(clientId) {
  const normalized = Number(clientId);
  if (!Number.isInteger(normalized) || normalized <= 0) return null;
  return null;
}

function resolveUserClient(clientId, userId) {
  const normalized = Number(clientId);
  if (!Number.isInteger(normalized) || normalized <= 0) return null;
  return db.prepare('SELECT * FROM clients WHERE id = ? AND user_id = ?').get(normalized, userId) || null;
}

function todayParts() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const date = `${map.year}-${map.month}-${map.day}`;
  const time = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  return { date, time };
}

function formatServiceTitle(serviceDate) {
  const [year, month, day] = serviceDate.split('-');
  const formattedDate = year && month && day ? `${day}/${month}/${year}` : serviceDate;
  return `Serviço ${formattedDate}`.trim();
}

app.post('/api/auth/register', (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!name || !email || password.length < 6) {
    return res.status(400).json({ error: 'Informe nome, e-mail e senha com pelo menos 6 caracteres.' });
  }
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
    return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
  }
  const { hash, salt } = hashPassword(password);
  const result = db.prepare(`
    INSERT INTO users (name, email, password_hash, password_salt)
    VALUES (?, ?, ?, ?)
  `).run(name, email, hash, salt);
  ensureUserSettings(result.lastInsertRowid);
  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  const { hash } = hashPassword(password, user.password_salt);
  if (hash !== user.password_hash) {
    return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  }
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/recover', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email || password.length < 6) {
    return res.status(400).json({ error: 'Informe o e-mail e a nova senha com pelo menos 6 caracteres.' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  const { hash, salt } = hashPassword(password);
  db.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?').run(hash, salt, user.id);
  res.json({ user: publicUser(user) });
});

app.use('/api', requireUser);

app.get('/api/dashboard', (req, res) => {
  res.json(dashboardPayload(req.user.id));
});

app.patch('/api/settings', (req, res) => {
  const current = getSettings(req.user.id);
  const rateCents = req.body.defaultRate === undefined ? current.default_rate_cents : centsFromReais(req.body.defaultRate);
  if (!Number.isInteger(rateCents) || rateCents <= 0) {
    return res.status(400).json({ error: 'Informe um valor de hora válido.' });
  }
  let defaultClientId = current.default_client_id || null;
  if (req.body.defaultClientId !== undefined) {
    defaultClientId = req.body.defaultClientId ? Number(req.body.defaultClientId) : null;
    if (defaultClientId) {
      const client = resolveUserClient(defaultClientId, req.user.id);
      if (!client) return res.status(400).json({ error: 'Cliente padrão inválido.' });
    }
  }
  db.prepare('UPDATE user_settings SET default_rate_cents = ?, default_client_id = ? WHERE user_id = ?')
    .run(rateCents, defaultClientId, req.user.id);
  res.json(dashboardPayload(req.user.id));
});

app.post('/api/clients', (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Informe o nome do cliente.' });

  db.prepare(`
    INSERT INTO clients (user_id, name, notes)
    VALUES (?, ?, ?)
  `).run(req.user.id, name, String(req.body.notes || '').trim());

  res.status(201).json(dashboardPayload(req.user.id));
});

app.patch('/api/clients/:id', (req, res) => {
  const id = Number(req.params.id);
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Informe o nome do cliente.' });

  const result = db.prepare(`
    UPDATE clients
    SET name = ?, notes = ?
    WHERE id = ? AND user_id = ?
  `).run(name, String(req.body.notes || '').trim(), id, req.user.id);

  if (!result.changes) return res.status(404).json({ error: 'Cliente não encontrado.' });

  db.prepare(`
    UPDATE services
    SET client = ?
    WHERE client_id = ? AND user_id = ?
  `).run(name, id, req.user.id);

  res.json(dashboardPayload(req.user.id));
});

app.delete('/api/clients/:id', (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare('DELETE FROM clients WHERE id = ? AND user_id = ?').run(id, req.user.id);
  if (!result.changes) return res.status(404).json({ error: 'Cliente não encontrado.' });
  db.prepare('UPDATE user_settings SET default_client_id = NULL WHERE user_id = ? AND default_client_id = ?')
    .run(req.user.id, id);
  res.json(dashboardPayload(req.user.id));
});

app.post('/api/services', (req, res) => {
  const fallback = todayParts();
  const serviceDate = String(req.body.serviceDate || fallback.date).trim();
  const serviceTime = String(req.body.serviceTime || '00:00').trim();
  const title = String(req.body.title || '').trim() || formatServiceTitle(serviceDate);

  if (!serviceDate || !serviceTime) {
    return res.status(400).json({ error: 'Informe a data e a hora do serviço.' });
  }

  const settings = getSettings(req.user.id);
  const requestedCurrency = normalizeCurrency(req.body.currency || (settings.pending_carryover_cents > 0 ? settings.pending_carryover_currency : 'BRL'));
  if (!requestedCurrency) return res.status(400).json({ error: 'Informe uma moeda válida.' });
  if (settings.pending_carryover_cents > 0 && requestedCurrency !== settings.pending_carryover_currency) {
    return res.status(400).json({ error: 'O próximo serviço precisa usar a mesma moeda do saldo transferido.' });
  }
  const clientRecord = resolveUserClient(req.body.clientId, req.user.id);
  if (req.body.clientId && !clientRecord) {
    return res.status(400).json({ error: 'Cliente selecionado não existe.' });
  }
  const clientName = clientRecord?.name || String(req.body.client || '').trim();
  const rateCents = req.body.rate ? centsFromReais(req.body.rate) : settings.default_rate_cents;
  if (!Number.isInteger(rateCents) || rateCents <= 0) {
    return res.status(400).json({ error: 'Informe um valor de hora válido.' });
  }
  const discountCents = req.body.discount ? centsFromReais(req.body.discount) : 0;
  if (!Number.isInteger(discountCents) || discountCents < 0) {
    return res.status(400).json({ error: 'Informe um ajuste válido.' });
  }
  const adjustmentType = normalizeAdjustmentType(req.body.adjustmentType);
  if (!adjustmentType) return res.status(400).json({ error: 'Informe um tipo de ajuste válido.' });

  const carryoverCents = settings.pending_carryover_cents;
  const insert = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO services (user_id, title, client_id, client, notes, service_date, service_time, currency, rate_cents, carryover_cents, discount_cents, adjustment_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      title,
      clientRecord?.id || null,
      clientName,
      String(req.body.notes || '').trim(),
      serviceDate,
      serviceTime,
      requestedCurrency,
      rateCents,
      carryoverCents,
      discountCents,
      adjustmentType
    );

    if (carryoverCents > 0) {
      db.prepare("UPDATE user_settings SET pending_carryover_cents = 0, pending_carryover_currency = 'BRL' WHERE user_id = ?").run(req.user.id);
    }
    return result.lastInsertRowid;
  });

  const id = insert();
  res.status(201).json({ service: getService(id, req.user.id), dashboard: dashboardPayload(req.user.id) });
});

app.patch('/api/services/:id', requireService, (req, res) => {
  const serviceDate = String(req.body.serviceDate || req.service.service_date || '').trim();
  const serviceTime = String(req.body.serviceTime || req.service.service_time || '').trim();
  const title = String(req.body.title || '').trim() || formatServiceTitle(serviceDate);
  if (!serviceDate || !serviceTime) {
    return res.status(400).json({ error: 'Informe a data e a hora do serviço.' });
  }
  const rateCents = centsFromReais(req.body.rate);
  if (rateCents === null || rateCents <= 0) {
    return res.status(400).json({ error: 'Informe um valor de hora válido.' });
  }
  const discountCents = centsFromReais(req.body.discount || 0);
  if (discountCents === null || discountCents < 0) {
    return res.status(400).json({ error: 'Informe um ajuste válido.' });
  }
  const adjustmentType = normalizeAdjustmentType(req.body.adjustmentType || req.service.adjustment_type);
  if (!adjustmentType) return res.status(400).json({ error: 'Informe um tipo de ajuste válido.' });
  const clientRecord = resolveUserClient(req.body.clientId, req.user.id);
  if (req.body.clientId && !clientRecord) {
    return res.status(400).json({ error: 'Cliente selecionado não existe.' });
  }
  const clientName = clientRecord?.name || String(req.body.client || '').trim();
  const requestedCurrency = normalizeCurrency(req.body.currency || req.service.currency);
  if (!requestedCurrency) return res.status(400).json({ error: 'Informe uma moeda válida.' });
  if (req.service.carryover_cents > 0 && requestedCurrency !== req.service.currency) {
    return res.status(400).json({ error: 'Não é possível alterar a moeda de um serviço com saldo transferido.' });
  }

  db.prepare(`
    UPDATE services
    SET title = ?, client_id = ?, client = ?, notes = ?, service_date = ?, service_time = ?, currency = ?, rate_cents = ?, discount_cents = ?, adjustment_type = ?
    WHERE id = ? AND user_id = ?
  `).run(
    title,
    clientRecord?.id || null,
    clientName,
    String(req.body.notes || '').trim(),
    serviceDate,
    serviceTime,
    requestedCurrency,
    rateCents,
    discountCents,
    adjustmentType,
    req.service.id,
    req.user.id
  );

  updateComputedStatus(req.service.id, req.user.id);
  res.json(dashboardPayload(req.user.id));
});

app.delete('/api/services/:id', requireService, (req, res) => {
  db.prepare('DELETE FROM services WHERE id = ? AND user_id = ?').run(req.service.id, req.user.id);
  res.json(dashboardPayload(req.user.id));
});

app.post('/api/services/:id/entries', requireService, (req, res) => {
  const workDate = String(req.body.workDate || '').trim();
  const startTime = String(req.body.startTime || '').trim();
  const endTime = String(req.body.endTime || '').trim();
  const minutes = minutesBetween(startTime, endTime);

  if (!workDate || !startTime || !endTime || !Number.isInteger(minutes) || minutes <= 0) {
    return res.status(400).json({ error: 'Informe data, início e fim com duração positiva.' });
  }

  db.prepare(`
    INSERT INTO time_entries (service_id, work_date, start_time, end_time, minutes, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.service.id, workDate, startTime, endTime, minutes, String(req.body.notes || '').trim());

  updateComputedStatus(req.service.id, req.user.id);
  res.status(201).json(dashboardPayload(req.user.id));
});

app.delete('/api/services/:id/entries/:entryId', requireService, (req, res) => {
  db.prepare('DELETE FROM time_entries WHERE id = ? AND service_id = ?')
    .run(Number(req.params.entryId), req.service.id);
  updateComputedStatus(req.service.id, req.user.id);
  res.json(dashboardPayload(req.user.id));
});

app.post('/api/services/:id/payments', requireService, (req, res) => {
  const amountCents = centsFromReais(req.body.amount);
  const mode = String(req.body.mode || 'keep-open');
  const service = getService(req.service.id, req.user.id);

  if (amountCents === null || amountCents < 0) {
    return res.status(400).json({ error: 'Informe um pagamento válido.' });
  }
  if (service.balanceCents <= 0) {
    return res.status(400).json({ error: 'Este serviço não possui saldo em aberto.' });
  }
  if (amountCents > service.balanceCents) {
    return res.status(400).json({ error: 'O pagamento não pode ultrapassar o saldo em aberto.' });
  }
  if (mode === 'transfer-next') {
    const settings = getSettings(req.user.id);
    if (settings.pending_carryover_cents > 0 && settings.pending_carryover_currency !== service.currency) {
      return res.status(400).json({ error: 'Já existe saldo transferido em outra moeda.' });
    }
  }

  const settle = db.transaction(() => {
    if (amountCents > 0) {
      db.prepare(`
        INSERT INTO payments (service_id, amount_cents, notes)
        VALUES (?, ?, ?)
      `).run(service.id, amountCents, String(req.body.notes || '').trim());
    }

    const updated = getService(service.id, req.user.id);
    if (updated.balanceCents <= 0) {
      db.prepare('UPDATE services SET status = ? WHERE id = ? AND user_id = ?').run('paid', service.id, req.user.id);
      return;
    }

    if (mode === 'transfer-next') {
      db.prepare(`
        UPDATE user_settings
        SET pending_carryover_cents = pending_carryover_cents + ?,
            pending_carryover_currency = ?
        WHERE user_id = ?
      `).run(updated.balanceCents, updated.currency, req.user.id);
      db.prepare('UPDATE services SET status = ? WHERE id = ? AND user_id = ?').run('transferred', service.id, req.user.id);
    } else {
      db.prepare('UPDATE services SET status = ? WHERE id = ? AND user_id = ?').run('open', service.id, req.user.id);
    }
  });

  settle();
  res.status(201).json(dashboardPayload(req.user.id));
});

app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Controle de horas rodando em http://127.0.0.1:${port}`);
});
