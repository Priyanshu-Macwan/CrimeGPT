const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const MAX_JSON = 1024 * 1024;
const MAX_FILE = 10 * 1024 * 1024;
const MAX_AUDIO_REQUEST = 26 * 1024 * 1024;
const TYPES = new Set(['Theft', 'Robbery', 'Burglary', 'Fraud', 'Assault', 'Lost property', 'Other']);
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }

function createApp(options = {}) {
  const firServiceUrl = new URL(options.firServiceUrl || process.env.FIR_SERVICE_URL || 'http://127.0.0.1:8001');
  if (firServiceUrl.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(firServiceUrl.hostname) || firServiceUrl.username || firServiceUrl.password || firServiceUrl.pathname !== '/' || firServiceUrl.search || firServiceUrl.hash) throw new Error('FIR_SERVICE_URL must be a local HTTP origin');
  const dataFile = options.dataFile || path.join(__dirname, '..', 'data', 'records.json');
  const evidenceDir = options.evidenceDir || path.join(path.dirname(dataFile), 'evidence');
  const users = options.users || [
    { id: process.env.CRIMEGPT_ADMIN_ID, password: process.env.CRIMEGPT_ADMIN_PASSWORD, role: 'admin' },
    { id: process.env.CRIMEGPT_OFFICER_ID, password: process.env.CRIMEGPT_OFFICER_PASSWORD, role: 'officer' },
  ].filter(user => user.id && user.password);
  if (!users.some(user => user.role === 'admin')) throw new Error('Set CRIMEGPT_ADMIN_ID and CRIMEGPT_ADMIN_PASSWORD before starting the backend.');
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.mkdirSync(evidenceDir, { recursive: true });
  let state = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : { cases: [], evidence: [], drafts: [], audit: [], nextCase: 1 };
  let writeQueue = Promise.resolve();
  const sessions = new Map();

  function mutate(change) {
    const result = writeQueue.then(async () => {
      const next = structuredClone(state);
      const value = change(next);
      const temporary = dataFile + '.' + crypto.randomUUID() + '.tmp';
      await fs.promises.writeFile(temporary, JSON.stringify(next, null, 2), { mode: 0o600 });
      await fs.promises.rename(temporary, dataFile);
      state = next;
      return value;
    });
    writeQueue = result.catch(() => {});
    return result;
  }
  function json(res, status, value, headers = {}) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers });
    res.end(JSON.stringify(value));
  }
  async function body(req, limit) {
    let size = 0;
    const chunks = [];
    for await (const chunk of req) {
      size += chunk.length;
      if (size > limit) throw new HttpError(413, 'Request exceeds size limit');
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
  async function input(req) {
    if (!req.headers['content-type']?.startsWith('application/json')) throw new HttpError(415, 'JSON content type required');
    try {
      const parsed = JSON.parse((await body(req, MAX_JSON)).toString('utf8'));
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new HttpError(400, 'A JSON object is required');
      return parsed;
    }
    catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, 'Invalid JSON'); }
  }
  function required(value, name, max = 500) {
    if (typeof value !== 'string' || !value.trim() || value.length > max) throw new HttpError(400, name + ' is required and must be at most ' + max + ' characters');
    return value.trim();
  }
  function optional(value, name, max = 500) {
    if (value == null) return '';
    if (typeof value !== 'string' || value.length > max) throw new HttpError(400, name + ' must be at most ' + max + ' characters');
    return value.trim();
  }
  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value + 'T00:00:00Z')) || new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) !== value) throw new HttpError(400, 'A valid incident date is required');
    return value;
  }
  function decoded(value) {
    try { return decodeURIComponent(value); }
    catch { throw new HttpError(400, 'Invalid URL encoding'); }
  }
  function publicEvidence(item) {
    const { diskName, ...visible } = item;
    return visible;
  }
  function tokenFrom(req) { return /(?:^|; )crimegpt_session=([^;]+)/.exec(req.headers.cookie || '')?.[1]; }
  function userFrom(req) {
    const token = tokenFrom(req), session = token && sessions.get(token);
    if (!session || session.expires < Date.now()) {
      if (token) sessions.delete(token);
      throw new HttpError(401, 'Authentication required');
    }
    return session.user;
  }
  function log(next, actor, action, target) {
    next.audit.unshift({ id: crypto.randomUUID(), actor, action, target, at: new Date().toISOString() });
    next.audit = next.audit.slice(0, 1000);
  }

  const server = http.createServer(async (req, res) => {
    try {
      const route = new URL(req.url, 'http://localhost').pathname;
      if (req.method === 'POST' && route === '/api/login') {
        const credentials = await input(req);
        const id = required(credentials.id, 'Officer ID', 100);
        const password = required(credentials.password, 'Password', 200);
        const user = users.find(candidate => candidate.id === id);
        const supplied = crypto.createHash('sha256').update(password).digest();
        const expected = crypto.createHash('sha256').update(user?.password || '').digest();
        if (!user || !crypto.timingSafeEqual(supplied, expected)) throw new HttpError(401, 'Invalid credentials');
        const token = crypto.randomBytes(32).toString('hex');
        sessions.set(token, { user: { id: user.id, role: user.role }, expires: Date.now() + 8 * 60 * 60 * 1000 });
        return json(res, 200, { user: { id: user.id, role: user.role } }, { 'Set-Cookie': 'crimegpt_session=' + token + '; HttpOnly; SameSite=Strict; Path=/api; Max-Age=28800' + (options.cookieSecure ? '; Secure' : '') });
      }
      if (!route.startsWith('/api/')) throw new HttpError(404, 'Not found');
      const user = userFrom(req);
      if (req.method === 'GET' && route === '/api/me') return json(res, 200, { user });
      if (req.method === 'POST' && route === '/api/logout') {
        sessions.delete(tokenFrom(req));
        return json(res, 200, { ok: true }, { 'Set-Cookie': 'crimegpt_session=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0' });
      }
      if (req.method === 'POST' && ['/api/fir/draft', '/api/fir/transcribe', '/api/fir/draft-from-audio'].includes(route)) {
        const isDraft = route === '/api/fir/draft';
        const contentType = req.headers['content-type'] || '';
        if (isDraft ? !contentType.startsWith('application/json') : !contentType.startsWith('multipart/form-data;')) throw new HttpError(415, isDraft ? 'JSON content type required' : 'Multipart audio upload required');
        const payload = await body(req, isDraft ? MAX_JSON : MAX_AUDIO_REQUEST);
        let upstream;
        try {
          upstream = await fetch(firServiceUrl.origin + route, {
            method: 'POST', headers: { 'Content-Type': contentType }, body: payload,
            signal: AbortSignal.timeout(route === '/api/fir/transcribe' ? 180000 : 250000),
          });
        } catch (error) {
          throw new HttpError(error.name === 'TimeoutError' ? 504 : 503, error.name === 'TimeoutError' ? 'Local FIR service timed out' : 'Local FIR service is unavailable');
        }
        let result;
        try { result = await upstream.json(); }
        catch { throw new HttpError(502, 'Local FIR service returned invalid JSON'); }
        return json(res, upstream.status, result);
      }
      if (req.method === 'GET' && route === '/api/cases') return json(res, 200, { cases: state.cases });
      if (req.method === 'POST' && route === '/api/cases') {
        const value = await input(req);
        const record = {
          title: required(value.title, 'Title', 200), type: required(value.type, 'Type', 50),
          otherCrimeType: optional(value.otherCrimeType, 'Other crime type', 100),
          date: validDate(value.date), location: required(value.location, 'Location', 300),
          precinct: required(value.precinct, 'Precinct', 50), description: required(value.description, 'Description', 10000),
          victim: required(value.victim, 'Complainant', 200), contact: optional(value.contact, 'Contact', 100),
          notes: optional(value.notes, 'Notes', 5000), suspect: optional(value.suspect, 'Suspect', 200),
          suspectStatus: optional(value.suspectStatus, 'Suspect status', 50), suspectDescription: optional(value.suspectDescription, 'Suspect description', 2000),
        };
        if (!TYPES.has(record.type)) throw new HttpError(400, 'Invalid case type');
        if (record.type === 'Other') record.otherCrimeType = required(value.otherCrimeType, 'Other crime type', 100);
        else record.otherCrimeType = '';
        const created = await mutate(next => {
          const id = 'CG-' + new Date().getFullYear() + '-' + String(next.nextCase++).padStart(3, '0');
          const result = { ...record, id, officer: user.id, status: 'Open', priority: 'Normal', createdAt: new Date().toISOString() };
          next.cases.unshift(result); log(next, user.id, 'case_created', id); return result;
        });
        return json(res, 201, { case: created });
      }
      const caseMatch = /^\/api\/cases\/([^/]+)$/.exec(route);
      if (req.method === 'GET' && caseMatch) {
        const found = state.cases.find(item => item.id === decoded(caseMatch[1]));
        if (!found) throw new HttpError(404, 'Case not found');
        return json(res, 200, { case: found });
      }
      if (req.method === 'GET' && route === '/api/evidence') return json(res, 200, { evidence: state.evidence.map(publicEvidence) });
      const caseEvidence = /^\/api\/cases\/([^/]+)\/evidence$/.exec(route);
      if (caseEvidence) {
        const caseId = decoded(caseEvidence[1]);
        if (!state.cases.some(item => item.id === caseId)) throw new HttpError(404, 'Case not found');
        if (req.method === 'GET') return json(res, 200, { evidence: state.evidence.filter(item => item.caseId === caseId).map(publicEvidence) });
        if (req.method === 'POST') {
          const name = required(decoded(req.headers['x-filename'] || ''), 'Filename', 255);
          const bytes = await body(req, MAX_FILE);
          if (!bytes.length) throw new HttpError(400, 'File is empty');
          const id = crypto.randomUUID(), diskName = id + '.bin';
          await fs.promises.writeFile(path.join(evidenceDir, diskName), bytes, { flag: 'wx', mode: 0o600 });
          try {
            const saved = await mutate(next => {
              const item = { id, caseId, name, size: bytes.length, mime: optional(req.headers['content-type'], 'Content type', 100) || 'application/octet-stream', sha256: crypto.createHash('sha256').update(bytes).digest('hex'), uploadedBy: user.id, uploadedAt: new Date().toISOString(), diskName };
              next.evidence.unshift(item); log(next, user.id, 'evidence_uploaded', id); return item;
            });
            return json(res, 201, { evidence: publicEvidence(saved) });
          } catch (error) { await fs.promises.unlink(path.join(evidenceDir, diskName)); throw error; }
        }
      }
      const download = /^\/api\/evidence\/([^/]+)\/file$/.exec(route);
      if (req.method === 'GET' && download) {
        const item = state.evidence.find(value => value.id === download[1]);
        if (!item) throw new HttpError(404, 'Evidence not found');
        let bytes;
        try { bytes = await fs.promises.readFile(path.join(evidenceDir, item.diskName)); }
        catch (error) { if (error.code === 'ENOENT') throw new HttpError(404, 'Evidence file missing'); throw error; }
        if (crypto.createHash('sha256').update(bytes).digest('hex') !== item.sha256) throw new HttpError(409, 'Evidence integrity check failed');
        res.writeHead(200, { 'Content-Type': item.mime, 'Content-Length': item.size, 'Content-Disposition': "attachment; filename*=UTF-8''" + encodeURIComponent(item.name), 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
        res.end(bytes);
        return;
      }
      if (req.method === 'GET' && route === '/api/drafts') return json(res, 200, { drafts: state.drafts });
      if (req.method === 'POST' && route === '/api/drafts') {
        const value = await input(req);
        const caseId = required(value.caseId, 'Case ID', 100);
        const statement = required(value.statement, 'Statement', 10000);
        const legalSections = optional(value.legalSections, 'Legal sections', 2000);
        const firDraft = optional(value.firDraft, 'FIR draft', 20000);
        const generationModel = optional(value.generationModel, 'Generation model', 100);
        const extractedInformation = value.extractedInformation == null ? null : value.extractedInformation;
        if (extractedInformation !== null && (typeof extractedInformation !== 'object' || Array.isArray(extractedInformation))) throw new HttpError(400, 'Extracted information must be an object');
        if (!state.cases.some(item => item.id === caseId)) throw new HttpError(404, 'Case not found');
        const created = await mutate(next => {
          const result = { id: crypto.randomUUID(), caseId, statement, legalSections, firDraft, extractedInformation, generationModel, status: 'pending_review', createdBy: user.id, createdAt: new Date().toISOString(), approvedBy: null, approvedAt: null };
          next.drafts.unshift(result); log(next, user.id, 'draft_created', result.id); return result;
        });
        return json(res, 201, { draft: created });
      }
      const approve = /^\/api\/drafts\/([^/]+)\/approve$/.exec(route);
      if (req.method === 'POST' && approve) {
        const result = await mutate(next => {
          const draft = next.drafts.find(item => item.id === approve[1]);
          if (!draft) throw new HttpError(404, 'Draft not found');
          if (draft.status !== 'pending_review') throw new HttpError(409, 'Draft already approved');
          draft.status = 'approved'; draft.approvedBy = user.id; draft.approvedAt = new Date().toISOString();
          log(next, user.id, 'draft_approved', draft.id); return draft;
        });
        return json(res, 200, { draft: result });
      }
      if (req.method === 'GET' && route === '/api/activity') return json(res, 200, { activity: state.audit.slice(0, 20) });
      if (req.method === 'GET' && route === '/api/admin/overview') {
        if (user.role !== 'admin') throw new HttpError(403, 'Administrator access required');
        return json(res, 200, { cases: state.cases, drafts: state.drafts, activity: state.audit });
      }
      throw new HttpError(404, 'Not found');
    } catch (error) {
      if (!res.headersSent) json(res, error.status || 500, { error: error.status ? error.message : 'Internal server error' });
      if (!error.status) console.error(error);
    }
  });
  return server;
}

if (require.main === module) {
  const server = createApp({ cookieSecure: process.env.NODE_ENV === 'production' });
  server.listen(Number(process.env.PORT || 5000), process.env.HOST || '127.0.0.1', () => console.log('CrimeGPT API listening on ' + server.address().port));
}
module.exports = { createApp };
