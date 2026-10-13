import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlass, UploadSimple } from '@phosphor-icons/react';
import WorkspaceShell from '../WorkspaceShell';
import { uploadEvidence } from '../../api';
import { useRemoteData } from '../../useRemoteData';

function fileKind(item) {
  if (item.mime?.startsWith('video/')) return 'Video';
  if (item.mime?.startsWith('image/')) return 'Image';
  if (item.mime?.startsWith('audio/')) return 'Audio';
  return 'Document';
}

export default function EvidencePage() {
  const { data: evidenceData, loading, error, refresh } = useRemoteData('/evidence', 'evidence');
  const { data: casesData, loading: casesLoading } = useRemoteData('/cases', 'cases');
  const items = evidenceData || [];
  const cases = casesData || [];
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('All types');
  const [selected, setSelected] = useState(null);
  const [caseId, setCaseId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (!caseId && cases.length) setCaseId(cases[0].id);
  }, [caseId, cases]);

  const visible = useMemo(() => items.filter(item => (kind === 'All types' || fileKind(item) === kind)
    && `${item.id} ${item.name} ${item.caseId}`.toLowerCase().includes(query.toLowerCase())), [items, kind, query]);

  async function handleUpload(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!caseId || !files.length) return;
    setUploading(true);
    setUploadError('');
    try {
      for (const file of files) await uploadEvidence(caseId, file);
      await refresh();
    } catch (uploadFailure) {
      setUploadError(`Upload stopped: ${uploadFailure.message}. Files saved before the error remain in the evidence register.`);
      await refresh().catch(() => {});
    } finally {
      setUploading(false);
    }
  }

  return (
    <WorkspaceShell title="EVIDENCE REGISTER">
      <div className="work-body">
        <div className="page-heading">
          <div><div className="eyebrow">Chain of custody / Records</div><h1>Evidence register</h1><p>Search, upload and download evidence linked to a case file.</p></div>
          <div className="actions evidence-upload-controls">
            <select className="select" aria-label="Choose case for evidence upload" value={caseId} onChange={event => setCaseId(event.target.value)} disabled={casesLoading || !cases.length}>
              {!cases.length && <option value="">{casesLoading ? 'Loading cases…' : 'Create a case first'}</option>}
              {cases.map(item => <option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}
            </select>
            <label className={`btn primary ${uploading || !cases.length ? 'disabled' : ''}`}>
              <UploadSimple /> {uploading ? 'Uploading…' : 'Add evidence'}
              <input type="file" multiple hidden disabled={uploading || !cases.length} onChange={handleUpload} />
            </label>
          </div>
        </div>
        {uploadError && <p className="form-error" role="alert">{uploadError}</p>}
        <div className="card-grid">{[
          ['TOTAL ITEMS', items.length], ['VIDEO', items.filter(item => fileKind(item) === 'Video').length],
          ['IMAGES', items.filter(item => fileKind(item) === 'Image').length], ['DOCUMENTS', items.filter(item => fileKind(item) === 'Document').length],
        ].map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{String(value).padStart(2, '0')}</strong></div>)}</div>
        <div className="toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MagnifyingGlass /><input className="field" placeholder="Search evidence or case…" value={query} onChange={event => setQuery(event.target.value)} /></div>
          <select className="select" style={{ width: 'auto' }} value={kind} onChange={event => setKind(event.target.value)}>{['All types', 'Video', 'Image', 'Audio', 'Document'].map(value => <option key={value}>{value}</option>)}</select>
        </div>
        <section className="panel">
          <div className="panel-title">All evidence <span className="small muted">{loading ? 'LOADING…' : `${visible.length} ITEMS`}</span></div>
          {error && <p className="form-error">Could not load evidence: {error} <button className="btn" onClick={() => refresh().catch(() => {})}>Retry</button></p>}
          <div className="table-wrap"><table className="work-table"><thead><tr><th>Evidence ID</th><th>Item</th><th>File type</th><th>Linked case</th><th>Added</th><th></th></tr></thead>
            <tbody>{visible.map(item => <tr key={item.id}><td>{item.id}</td><td><b>{item.name}</b></td><td>{fileKind(item)} · {item.mime}</td><td><Link className="table-link" to={`/cases/${item.caseId}`}>{item.caseId}</Link></td><td>{new Date(item.uploadedAt).toLocaleString()}</td><td><button className="btn" onClick={() => setSelected(item)}>Preview</button></td></tr>)}</tbody>
          </table>{!loading && !error && !visible.length && <div className="empty">No evidence matches your search.</div>}</div>
        </section>
      </div>
      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section className="modal" onClick={event => event.stopPropagation()}>
        <div className="modal-head"><h2>Evidence record</h2><button className="icon-button" onClick={() => setSelected(null)}>×</button></div>
        <div className="notice">{fileKind(selected)} · {selected.id} · SHA-256 {selected.sha256}</div>
        <h3 style={{ marginTop: 18 }}>{selected.name}</h3><p className="muted">Added {new Date(selected.uploadedAt).toLocaleString()} by {selected.uploadedBy}</p>
        <p>Linked case: <Link className="table-link" to={`/cases/${selected.caseId}`} onClick={() => setSelected(null)}>{selected.caseId}</Link></p>
        <div className="actions"><button className="btn" onClick={() => setSelected(null)}>Close</button><a className="btn primary" href={`/api/evidence/${encodeURIComponent(selected.id)}/file`}>Download file</a></div>
      </section></div>}
    </WorkspaceShell>
  );
}
