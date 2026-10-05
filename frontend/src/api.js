export async function request(path, options = {}) {
  const response = await fetch('/api' + path, {
    credentials: 'same-origin',
    ...options,
    headers: options.body instanceof File || options.body instanceof FormData
      ? { ...options.headers }
      : { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });
  if (!response.ok) {
    let message = 'Request failed';
    try { message = (await response.json()).error || message; } catch { message = response.statusText || message; }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return response.headers.get('content-type')?.includes('application/json') ? response.json() : response;
}

export function uploadEvidence(caseId, file) {
  return request('/cases/' + encodeURIComponent(caseId) + '/evidence', {
    method: 'POST',
    body: file,
    headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-Filename': encodeURIComponent(file.name) },
  });
}
