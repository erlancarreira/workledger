import crypto from 'node:crypto';

const githubApi = 'https://api.github.com';

export function githubConfigured() {
  return Boolean(process.env.GITHUB_APP_ID && process.env.GITHUB_PRIVATE_KEY_BASE64);
}

export function githubOAuthConfigured() {
  return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
}

function privateKey() {
  if (!process.env.GITHUB_PRIVATE_KEY_BASE64) throw new Error('GITHUB_PRIVATE_KEY_BASE64 não configurada.');
  return Buffer.from(process.env.GITHUB_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
}

function base64url(value) {
  return Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');
}

export function createAppJwt() {
  if (!githubConfigured()) throw new Error('Integração GitHub não configurada.');
  const now = Math.floor(Date.now() / 1000);
  const encodedHeader = base64url({ alg: 'RS256', typ: 'JWT' });
  const encodedPayload = base64url({ iat: now - 60, exp: now + 540, iss: String(process.env.GITHUB_APP_ID) });
  const body = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createSign('RSA-SHA256').update(body).end().sign(privateKey()).toString('base64url');
  return `${body}.${signature}`;
}

async function githubRequest(url, { token, method = 'GET', body } = {}) {
  const response = await fetch(url.startsWith('http') ? url : `${githubApi}${url}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'WorkLedger-GitHub-App',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `GitHub respondeu com ${response.status}.`);
  return data;
}

export async function getInstallation(installationId) {
  return githubRequest(`/app/installations/${Number(installationId)}`, { token: createAppJwt() });
}

export async function getAppInstallations() {
  return githubRequest('/app/installations?per_page=100', { token: createAppJwt() });
}

export async function getInstallationToken(installationId) {
  const result = await githubRequest(`/app/installations/${Number(installationId)}/access_tokens`, { token: createAppJwt(), method: 'POST' });
  return result.token;
}

export async function getInstallationRepositories(installationId) {
  const token = await getInstallationToken(installationId);
  const result = await githubRequest('/installation/repositories?per_page=100', { token });
  return result.repositories || [];
}

export async function getRepositoryCommits(installationId, fullName) {
  const token = await getInstallationToken(installationId);
  return githubRequest(`/repos/${fullName}/commits?per_page=30`, { token });
}

export function verifyWebhook(rawBody, signature) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !signature?.startsWith('sha256=')) return false;
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`;
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  return expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

export function installationUrl() {
  if (!process.env.GITHUB_APP_SLUG) return null;
  return `https://github.com/apps/${encodeURIComponent(process.env.GITHUB_APP_SLUG)}/installations/new`;
}

export function oauthAuthorizationUrl(state, callbackUrl) {
  if (!githubOAuthConfigured()) throw new Error('GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET não configurados.');
  const query = new URLSearchParams({ client_id: process.env.GITHUB_CLIENT_ID, redirect_uri: callbackUrl, state });
  return `https://github.com/login/oauth/authorize?${query}`;
}

export async function getUserInstallations(code, callbackUrl) {
  if (!githubOAuthConfigured()) throw new Error('Credenciais OAuth do GitHub não configuradas.');
  const exchange = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code, redirect_uri: callbackUrl })
  });
  const tokenPayload = await exchange.json().catch(() => ({}));
  if (!exchange.ok || !tokenPayload.access_token) throw new Error(tokenPayload.error_description || 'Não foi possível autorizar sua conta no GitHub.');
  const installations = await githubRequest('/user/installations?per_page=100', { token: tokenPayload.access_token });
  return installations.installations || [];
}
