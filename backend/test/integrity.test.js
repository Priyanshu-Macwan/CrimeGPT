const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createApp } = require('../src/index');

test('AC3: altered evidence is refused and oversized files are not saved', async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'crimegpt-integrity-'));
  const dataFile = path.join(directory, 'records.json');
  const evidenceDir = path.join(directory, 'evidence');
  const server = createApp({ dataFile, evidenceDir, users: [{ id: 'chief', password: 'secret', role: 'admin' }] });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir()) + path.sep));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const base = 'http://127.0.0.1:' + server.address().port + '/api';
  const login = await fetch(base + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'chief', password: 'secret' }) });
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const record = await fetch(base + '/cases', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Test', type: 'Theft', date: '2026-10-05', location: 'Road', precinct: '7B', description: 'Reported fact', victim: 'Test person' }) });
  const caseId = (await record.json()).case.id;
  const tooLarge = await fetch(base + '/cases/' + caseId + '/evidence', { method: 'POST', headers: { Cookie: cookie, 'X-Filename': 'large.bin' }, body: Buffer.alloc(10 * 1024 * 1024 + 1) });
  assert.equal(tooLarge.status, 413);
  assert.equal(fs.readdirSync(evidenceDir).length, 0);
  const uploaded = await fetch(base + '/cases/' + caseId + '/evidence', { method: 'POST', headers: { Cookie: cookie, 'X-Filename': 'proof.txt' }, body: Buffer.from('original') });
  assert.equal(uploaded.status, 201);
  const item = (await uploaded.json()).evidence;
  const internal = JSON.parse(fs.readFileSync(dataFile, 'utf8')).evidence[0];
  fs.writeFileSync(path.join(evidenceDir, internal.diskName), 'altered');
  const download = await fetch(base + '/evidence/' + item.id + '/file', { headers: { Cookie: cookie } });
  assert.equal(download.status, 409);
  assert.match((await download.json()).error, /integrity/i);
  assert.equal((await fetch(base + '/cases/%ZZ', { headers: { Cookie: cookie } })).status, 400);
});
