const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createApp } = require('../src/index');

const baseCase = { title: 'Reported incident', type: 'Other', date: '2026-10-05', location: 'Surat, Gujarat', precinct: '7B', description: 'An incident was reported.', victim: 'Witness' };

async function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'crimegpt-other-'));
  const server = createApp({ dataFile: path.join(directory, 'records.json'), evidenceDir: path.join(directory, 'evidence'), users: [{ id: 'chief', password: 'admin-secret', role: 'admin' }, { id: 'officer', password: 'secret', role: 'officer' }] });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir()) + path.sep));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const root = `http://127.0.0.1:${server.address().port}/api`;
  const login = await fetch(root + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'officer', password: 'secret' }) });
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const create = value => fetch(root + '/cases', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
  const list = () => fetch(root + '/cases', { headers: { Cookie: cookie } });
  return { create, list };
}

test('AC Other requires a meaningful custom crime type and preserves it', async t => {
  const f = await fixture(t);
  assert.equal((await f.create(baseCase)).status, 400); // AC: no blank Other classification
  assert.equal((await f.create({ ...baseCase, otherCrimeType: ' \t ' })).status, 400); // AC: whitespace is blank
  assert.equal((await f.create({ ...baseCase, otherCrimeType: 'x'.repeat(101) })).status, 400); // AC: length bound
  const response = await f.create({ ...baseCase, otherCrimeType: '  Cybercrime  ' });
  assert.equal(response.status, 201); // AC: valid custom type saves
  assert.equal((await response.json()).case.otherCrimeType, 'Cybercrime'); // AC: trimmed display value
  const cases = (await (await f.list()).json()).cases;
  assert.equal(cases.length, 1); // AC: failed attempts do not persist
  assert.equal(cases[0].otherCrimeType, 'Cybercrime'); // AC: saved case returns custom type
});

test('AC preset crime types ignore stale Other text', async t => {
  const f = await fixture(t);
  const response = await f.create({ ...baseCase, type: 'Theft', otherCrimeType: 'Stale custom crime' });
  assert.equal(response.status, 201);
  assert.equal((await response.json()).case.otherCrimeType, ''); // AC: preset remains authoritative
});

test('AC custom type property: diverse short labels round-trip after trim', async t => {
  const f = await fixture(t);
  const labels = Array.from({ length: 24 }, (_, index) => `Type ${index} ગુજરાતી`);
  for (const label of labels) {
    const response = await f.create({ ...baseCase, otherCrimeType: ` ${label} ` });
    assert.equal(response.status, 201); // AC: every valid short label accepted
    assert.equal((await response.json()).case.otherCrimeType, label); // AC: Unicode round-trip
  }
});
