import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import WorkspaceShell from '../WorkspaceShell';
import { useApi } from '../../useApi';
import { uploadEvidence } from '../../api';
const EMPTY_EVIDENCE = [];

export default function EvidencePage() {
  const [params] = useSearchParams();
  const { data: casesData, error: casesError } = useApi('/cases');
  const { data: evidenceData, error: evidenceError, reload } = useApi('/evidence');
  const cases = casesData?.cases || [];
  const evidence = evidenceData?.evidence || EMPTY_EVIDENCE;
  const [caseId, setCaseId] = useState(params.get('caseId') || '');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const selectedId = caseId || cases[0]?.id || '';
  const shown = useMemo(() => evidence.filter(item => [item.id, item.name, item.caseId].join(' ').toLowerCase().includes(query.toLowerCase())), [evidence, query]);
  async function upload(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!selectedId) { setError('Create a case before adding evidence.'); return; }
    setError(''); setUploading(true);
    try {
      for (const file of files) await uploadEvidence(selectedId, file);
      await reload();
    } catch (failure) { setError(failure.message); }
    finally { setUploading(false); }
  }
  return <WorkspaceShell title="EVIDENCE REGISTER"><div className="work-body">
    <div className="page-heading"><div><div className="eyebrow">Records / Evidence</div><h1>Evidence register</h1><p>Files are stored with their case link, uploader, time, and SHA-256 fingerprint.</p></div></div>
    {(error || casesError || evidenceError) && <p role="alert" className="form-error">{error || casesError || evidenceError}</p>}
    <div className="toolbar"><label htmlFor="evidence-case">Attach to case</label><select id="evidence-case" className="select" value={selectedId} onChange={e => setCaseId(e.target.value)}>{!cases.length && <option value="">No cases</option>}{cases.map(item => <option value={item.id} key={item.id}>{item.id} · {item.title}</option>)}</select><label className="btn primary">{uploading ? 'Uploading…' : 'Add evidence'}<input type="file" multiple hidden disabled={uploading || !selectedId} onChange={upload}/></label></div>
    <div className="toolbar"><input className="field" placeholder="Search evidence or case…" value={query} onChange={e => setQuery(e.target.value)}/><span>{shown.length} items</span></div>
    <section className="panel"><div className="panel-title">Recorded evidence</div><div className="table-wrap"><table className="work-table"><thead><tr><th>File</th><th>Case</th><th>Size</th><th>Uploaded</th><th>Fingerprint</th><th></th></tr></thead><tbody>{shown.map(item => <tr key={item.id}><td>{item.name}</td><td><Link to={`/cases/${item.caseId}`}>{item.caseId}</Link></td><td>{(item.size / 1024).toFixed(1)} KB</td><td>{item.uploadedAt}<div className="small muted">{item.uploadedBy}</div></td><td className="small">{item.sha256}</td><td><a className="btn" href={`/api/evidence/${item.id}/file`}>Download</a></td></tr>)}</tbody></table>{!shown.length && <div className="empty">No evidence recorded for this search.</div>}</div></section>
  </div></WorkspaceShell>;
}
