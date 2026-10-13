const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { createApp } = require('../src/index');

const users = [
  { id: 'chief', password: 'admin-secret', role: 'admin' },
  { id: 'officer', password: 'officer-secret', role: 'officer' },
];
const validCase = { title: 'Missing item', type: 'Theft', date: '2026-10-01', location: 'Central Road', precinct: '7B', description: 'Item reported missing', victim: 'A Person' };

async function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'crimegpt-test-'));
  const dataFile = path.join(directory, 'records.json');
  const evidenceDir = path.join(directory, 'evidence');
  const server = createApp({ dataFile, evidenceDir, users });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir()) + path.sep));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  async function call(route, options = {}, cookie = '') {
    return fetch(base + '/api' + route, { ...options, headers: { ...(cookie ? { Cookie: cookie } : {}), ...options.headers } });
  }
  async function login(id, password) {
    const response = await call('/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, password }) });
    return { response, cookie: response.headers.get('set-cookie')?.split(';')[0] || '' };
  }
  async function createCase(cookie, value = validCase) {
    return call('/cases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) }, cookie);
  }
  return { directory, dataFile, evidenceDir, server, base, call, login, createCase };
}

test('AC1: credentials, direct access, role access, and logout', async t => {
  const f = await fixture(t);
  assert.equal((await f.call('/cases')).status, 401);
  assert.equal((await f.call('/admin/overview')).status, 401);
  assert.equal((await f.login('chief', 'wrong')).response.status, 401);
  const officer = await f.login('officer', 'officer-secret');
  assert.equal(officer.response.status, 200);
  assert.equal((await f.call('/admin/overview', {}, officer.cookie)).status, 403);
  assert.equal((await f.call('/cases', {}, officer.cookie)).status, 200);
  assert.equal((await f.call('/logout', { method: 'POST' }, officer.cookie)).status, 200);
  assert.equal((await f.call('/cases', {}, officer.cookie)).status, 401);
  const admin = await f.login('chief', 'admin-secret');
  assert.equal((await f.call('/admin/overview', {}, admin.cookie)).status, 200);
});

test('AC2: malformed and invalid case inputs are rejected', async t => {
  const f = await fixture(t);
  const { cookie } = await f.login('officer', 'officer-secret');
  const malformed = await f.call('/cases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }, cookie);
  assert.equal(malformed.status, 400);
  assert.equal((await f.createCase(cookie, null)).status, 400);
  assert.equal((await f.createCase(cookie, { ...validCase, title: '  ' })).status, 400);
  assert.equal((await f.createCase(cookie, { ...validCase, date: '2026-02-30' })).status, 400);
  assert.equal((await f.createCase(cookie, { ...validCase, type: 'Unknown' })).status, 400);
  assert.equal((await f.call('/cases/missing', {}, cookie)).status, 404);
  assert.deepEqual((await (await f.call('/cases', {}, cookie)).json()).cases, []);
});

test('AC2: concurrent case registration gives unique IDs and persists', async t => {
  const f = await fixture(t);
  const { cookie } = await f.login('officer', 'officer-secret');
  const responses = await Promise.all(Array.from({ length: 20 }, (_, index) => f.createCase(cookie, { ...validCase, title: 'Case ' + index })));
  assert.ok(responses.every(response => response.status === 201));
  const created = await Promise.all(responses.map(response => response.json()));
  const ids = created.map(item => item.case.id);
  assert.equal(new Set(ids).size, 20);
  assert.ok(ids.every(id => /^CG-\d{4}-\d{3}$/.test(id)));
  const stored = JSON.parse(fs.readFileSync(f.dataFile, 'utf8'));
  assert.equal(stored.cases.length, 20);
  assert.equal(stored.audit.filter(item => item.action === 'case_created').length, 20);
  assert.equal((await (await f.call('/cases/' + ids[0], {}, cookie)).json()).case.id, ids[0]);
});

test('AC3: evidence bytes, case link, fingerprint and download survive server restart', async t => {
  const f = await fixture(t);
  const { cookie } = await f.login('officer', 'officer-secret');
  const created = await (await f.createCase(cookie)).json();
  const id = created.case.id;
  const bytes = Buffer.from('evidence contents');
  const upload = await f.call('/cases/' + id + '/evidence', { method: 'POST', headers: { 'Content-Type': 'application/octet-stream', 'X-Filename': encodeURIComponent('../item.txt') }, body: bytes }, cookie);
  assert.equal(upload.status, 201);
  const item = (await upload.json()).evidence;
  assert.equal(item.caseId, id);
  assert.equal(item.sha256, crypto.createHash('sha256').update(bytes).digest('hex'));
  assert.equal((await f.call('/cases/missing/evidence', { method: 'POST', headers: { 'X-Filename': 'x' }, body: bytes }, cookie)).status, 404);
  assert.equal((await f.call('/cases/' + id + '/evidence', { method: 'POST', headers: { 'X-Filename': 'empty' }, body: Buffer.alloc(0) }, cookie)).status, 400);
  assert.equal(fs.readdirSync(f.evidenceDir).length, 1);
  await new Promise(resolve => f.server.close(resolve));
  const restarted = createApp({ dataFile: f.dataFile, evidenceDir: f.evidenceDir, users });
  await new Promise(resolve => restarted.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => restarted.close(resolve)));
  const again = 'http://127.0.0.1:' + restarted.address().port;
  const response = await fetch(again + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'officer', password: 'officer-secret' }) });
  const newCookie = response.headers.get('set-cookie').split(';')[0];
  const download = await fetch(again + '/api/evidence/' + item.id + '/file', { headers: { Cookie: newCookie } });
  assert.equal(download.status, 200);
  assert.deepEqual(Buffer.from(await download.arrayBuffer()), bytes);
});

test('AC4: drafts are tied to a case, persist approval, and reject duplicate approval', async t => {
  const f = await fixture(t);
  const { cookie } = await f.login('officer', 'officer-secret');
  const id = (await (await f.createCase(cookie)).json()).case.id;
  const invalid = await f.call('/drafts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caseId: 'missing', statement: 'Facts' }) }, cookie);
  assert.equal(invalid.status, 404);
  const response = await f.call('/drafts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caseId: id, statement: 'Facts', legalSections: '' }) }, cookie);
  assert.equal(response.status, 201);
  const draft = (await response.json()).draft;
  assert.equal(draft.legalSections, '');
  assert.equal(draft.status, 'pending_review');
  assert.equal((await f.call('/drafts/' + draft.id + '/approve', { method: 'POST' }, cookie)).status, 200);
  assert.equal((await f.call('/drafts/' + draft.id + '/approve', { method: 'POST' }, cookie)).status, 409);
  const stored = JSON.parse(fs.readFileSync(f.dataFile, 'utf8'));
  assert.equal(stored.drafts[0].status, 'approved');
  assert.equal(stored.drafts[0].approvedBy, 'officer');
  assert.equal(stored.audit.filter(item => item.action === 'draft_approved').length, 1);
});
