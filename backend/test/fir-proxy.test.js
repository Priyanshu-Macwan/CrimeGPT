const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { createApp } = require('../src/index');

test('FIR service URL cannot send incident data to a remote host', () => {
  assert.throws(() => createApp({ firServiceUrl: 'https://example.com', users: [{ id: 'chief', password: 'secret', role: 'admin' }] }), /local HTTP origin/);
});

test('FIR proxy requires login, forwards JSON/audio, and reports unavailable service', async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'crimegpt-fir-'));
  let requests = [];
  const upstream = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    requests.push({ url: req.url, contentType: req.headers['content-type'], body: Buffer.concat(chunks) });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ extracted_information: {}, fir_draft: 'Review draft' }));
  });
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve));
  const service = createApp({
    dataFile: path.join(directory, 'records.json'),
    users: [{ id: 'chief', password: 'secret', role: 'admin' }],
    firServiceUrl: 'http://127.0.0.1:' + upstream.address().port,
  });
  await new Promise(resolve => service.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise(resolve => service.close(resolve));
    if (upstream.listening) await new Promise(resolve => upstream.close(resolve));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const base = 'http://127.0.0.1:' + service.address().port + '/api';
  const draft = JSON.stringify({ scenario: 'A person took my phone near the railway station yesterday.' });
  const anonymous = await fetch(base + '/fir/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: draft });
  assert.equal(anonymous.status, 401); // AC: no anonymous model access
  assert.equal(requests.length, 0);
  const login = await fetch(base + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'chief', password: 'secret' }) });
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const generated = await fetch(base + '/fir/draft', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: draft });
  assert.equal(generated.status, 200); // AC: authenticated text reaches local service
  assert.equal(requests[0].url, '/api/fir/draft');
  assert.equal(requests[0].body.toString(), draft);
  const form = new FormData();
  form.append('file', new Blob([Buffer.from('RIFF1234WAVE')]), 'clip.wav');
  const audio = await fetch(base + '/fir/transcribe', { method: 'POST', headers: { Cookie: cookie }, body: form });
  assert.equal(audio.status, 200); // AC: audio multipart body reaches service
  assert.match(requests[1].contentType, /^multipart\/form-data;/);
  assert.ok(requests[1].body.includes(Buffer.from('clip.wav')));
  await new Promise(resolve => upstream.close(resolve));
  const offline = await fetch(base + '/fir/draft', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: draft });
  assert.equal(offline.status, 503); // AC: local service outage is a clean error
});
