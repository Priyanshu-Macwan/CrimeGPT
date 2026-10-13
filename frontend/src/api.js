const API_ROOT = '/api';

export async function request(path, options = {}) {
  const body = options.body;
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = { ...options.headers };
  if (body != null && !isForm && !(body instanceof Blob) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(`${API_ROOT}${path}`, {
    credentials: 'same-origin',
    ...options,
    headers,
    body: body != null && !isForm && !(body instanceof Blob) && typeof body !== 'string'
      ? JSON.stringify(body)
      : body,
  });
  if (!response.ok) {
    let message = 'Request failed';
    try { message = (await response.json()).error || message; }
    catch { message = response.statusText || message; }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return null;
  return response.headers.get('content-type')?.includes('application/json')
    ? response.json()
    : response;
}

export function uploadEvidence(caseId, file) {
  return request(`/cases/${encodeURIComponent(caseId)}/evidence`, {
    method: 'POST',
    body: file,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-Filename': encodeURIComponent(file.name),
    },
  });
}

