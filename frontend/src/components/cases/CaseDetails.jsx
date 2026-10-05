import React, { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import WorkspaceShell from '../WorkspaceShell';
import { useApi } from '../../useApi';
import { caseTypeLabel } from '../../caseType';

const tabs = ['Overview', 'People', 'Evidence', 'Timeline', 'FIR'];
export default function CaseDetails() {
  const { caseId } = useParams();
  const [params] = useSearchParams();
  const { data, error, loading } = useApi('/cases/' + encodeURIComponent(caseId));
  const { data: evidenceData } = useApi('/cases/' + encodeURIComponent(caseId) + '/evidence');
  const { data: draftData } = useApi('/drafts');
  const [tab, setTab] = useState('Overview');
  const c = data?.case;
  const evidence = evidenceData?.evidence || [];
  const drafts = (draftData?.drafts || []).filter(item => item.caseId === caseId);
  return <WorkspaceShell title="CASE DETAIL"><div className="work-body">
    <div className="eyebrow"><Link to="/cases">Case files</Link> / {caseId}</div>
    {loading && <p>Loading case…</p>}
    {error && <div className="notice" role="alert">{error}. <Link to="/cases">Return to cases</Link></div>}
    {params.get('uploadError') && <div className="notice" role="alert">Case saved, but an evidence upload failed: {params.get('uploadError')}. Add the file from Evidence.</div>}
    {c && <><div className="page-heading"><div><div className="eyebrow">{c.id} · {c.status}</div><h1>{c.title}</h1><p>{caseTypeLabel(c)} · {c.date} · {c.location} · Officer: {c.officer}</p></div><div className="actions"><Link className="btn primary" to={`/filing?caseId=${encodeURIComponent(c.id)}`}>Prepare FIR draft</Link></div></div>
      <div className="tab-row">{tabs.map(name => <button className={tab === name ? 'active' : ''} onClick={() => setTab(name)} key={name}>{name}{name === 'Evidence' ? ` (${evidence.length})` : ''}</button>)}</div>
      {tab === 'Overview' && <section className="panel"><div className="panel-title">Incident details</div><div className="panel-content"><p>{c.description}</p><p>Precinct: {c.precinct} · Priority: {c.priority}</p></div></section>}
      {tab === 'People' && <section className="panel"><div className="panel-title">People linked to case</div><div className="panel-content"><p>Complainant: <b>{c.victim}</b></p><p>Contact: {c.contact || 'Not recorded'}</p><p>Suspect: {c.suspect || 'Unknown'}</p><p>{c.suspectDescription}</p></div></section>}
      {tab === 'Evidence' && <section className="panel"><div className="panel-title">Evidence <Link to={`/evidence?caseId=${encodeURIComponent(c.id)}`}>Add evidence</Link></div><div className="panel-content">{evidence.map(item => <div className="evidence-row" key={item.id}><div><b>{item.name}</b><div className="small muted">{item.uploadedAt} · SHA-256 {item.sha256}</div></div><a className="btn" href={`/api/evidence/${item.id}/file`}>Download</a></div>)}{!evidence.length && <p>No evidence recorded.</p>}</div></section>}
      {tab === 'Timeline' && <section className="panel"><div className="panel-title">Recorded events</div><div className="panel-content"><p>{c.createdAt} · Case registered by {c.officer}</p>{drafts.map(item => <p key={item.id}>{item.createdAt} · Draft {item.status.replace('_', ' ')} by {item.createdBy}</p>)}</div></section>}
      {tab === 'FIR' && <section className="panel"><div className="panel-title">FIR drafts</div><div className="panel-content">{drafts.map(item => <p key={item.id}>{item.id} · {item.status.replace('_', ' ')} · {item.createdAt}</p>)}{!drafts.length && <p>No draft recorded.</p>}<Link className="btn primary" to={`/filing?caseId=${encodeURIComponent(c.id)}`}>Open FIR workspace</Link></div></section>}
    </>}
  </div></WorkspaceShell>;
}
