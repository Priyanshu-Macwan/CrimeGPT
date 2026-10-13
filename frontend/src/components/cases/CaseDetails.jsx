import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PencilSimple, ShareNetwork, Printer } from '@phosphor-icons/react';
import WorkspaceShell from '../WorkspaceShell';
import { useRemoteData } from '../../useRemoteData';

const tabs = ['Overview', 'People', 'Evidence', 'Timeline', 'FIR'];

export default function CaseDetails() {
  const { caseId } = useParams();
  const encodedId = encodeURIComponent(caseId);
  const { data: caseRecord, loading, error } = useRemoteData(`/cases/${encodedId}`, 'case');
  const { data: evidenceData, loading: evidenceLoading, error: evidenceError } = useRemoteData(`/cases/${encodedId}/evidence`, 'evidence');
  const { data: draftsData } = useRemoteData('/drafts', 'drafts');
  const { data: activityData } = useRemoteData('/activity', 'activity');
  const [tab, setTab] = useState('Overview');
  const [copied, setCopied] = useState(false);
  const c = caseRecord;
  const evidence = evidenceData || [];
  const drafts = (draftsData || []).filter(draft => draft.caseId === caseId);
  const activity = (activityData || []).filter(item => item.target === caseId);

  async function shareCase() {
    try {
      if (navigator.share) await navigator.share({ title: c?.title, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setCopied(true); }
    } catch { setCopied(false); }
  }

  return (
    <WorkspaceShell title="CASE DETAIL">
      <div className="work-body">
        <div className="eyebrow"><Link to="/cases">Case files</Link> / {caseId}</div>
        {loading && <div className="empty">Loading case file…</div>}
        {error && <div className="form-error" role="alert">Unable to load this case: {error}</div>}
        {c && <>
          <div className="page-heading" style={{ marginTop: 12 }}>
            <div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}><span className="btn primary">#{c.id}</span><span className="eyebrow">PRIORITY: {c.priority}</span><span className="stamp red">{c.status}</span></div>
              <h1>{c.title}</h1>
              <p>{c.type === 'Other' ? c.otherCrimeType : c.type} &nbsp; | &nbsp; {new Date(`${c.date}T12:00`).toLocaleDateString()} &nbsp; | &nbsp; {c.location} &nbsp; | &nbsp; Officer: {c.officer}</p>
            </div>
            <div className="actions"><button className="btn" onClick={shareCase}><ShareNetwork /> {copied ? 'Link copied' : 'Share'}</button><button className="btn" onClick={() => window.print()}><Printer /> Print</button><Link className="btn primary" to={`/filing?case=${encodeURIComponent(c.id)}`}><PencilSimple /> Generate FIR</Link></div>
          </div>
          <div className="tab-row">{tabs.map(item => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}{item === 'Evidence' ? ` (${evidence.length})` : ''}</button>)}</div>
          {tab === 'Overview' && <div className="two-col">
            <section className="panel"><div className="panel-title">▤ Case description</div><div className="detail-block"><h3>Incident details</h3><p>{c.description}</p></div><div className="detail-block"><h3>Location</h3><div className="notice"><b>{c.location}</b><br />Precinct / unit {c.precinct}</div></div></section>
            <section className="panel"><div className="panel-title">♙ Persons of interest</div><div className="panel-content"><div className="person-row"><div><b>{c.victim}</b><div className="small muted">ROLE: VICTIM / WITNESS</div>{c.contact && <div className="small muted">{c.contact}</div>}</div></div><div className="person-row"><div><b>{c.suspect || 'Unknown suspect'}</b><div className="small muted">ROLE: PRIMARY SUSPECT</div><div className="small muted">{c.suspectStatus || 'Status not recorded'}</div>{c.suspectDescription && <p>{c.suspectDescription}</p>}</div></div></div></section>
          </div>}
          {tab === 'People' && <section className="panel"><div className="panel-title">People linked to case</div><div className="panel-content"><div className="person-row"><div><b>{c.victim}</b><div className="small muted">Victim / complainant</div>{c.contact && <div>{c.contact}</div>}</div></div><div className="person-row"><div><b>{c.suspect || 'Unknown suspect'}</b><div className="small muted">Primary suspect · {c.suspectStatus || 'Unknown'}</div>{c.suspectDescription && <div>{c.suspectDescription}</div>}</div></div></div></section>}
          {tab === 'Evidence' && <section className="panel"><div className="panel-title">Evidence log <Link className="btn" to="/evidence">Manage evidence</Link></div><div className="panel-content">{evidenceLoading && <p>Loading evidence…</p>}{evidenceError && <p className="form-error">Could not load evidence: {evidenceError}</p>}{evidence.map(item => <div className="evidence-row" key={item.id}><span className="file-chip">{item.mime?.split('/').pop()?.toUpperCase() || 'FILE'}</span><div style={{ flex: 1 }}><b>{item.name}</b><div className="small muted">{new Date(item.uploadedAt).toLocaleString()} · {item.uploadedBy} · SHA-256 {item.sha256?.slice(0, 12)}…</div></div><a className="btn" href={`/api/evidence/${encodeURIComponent(item.id)}/file`}>Download</a></div>)}{!evidenceLoading && !evidenceError && !evidence.length && <div className="empty">No evidence is attached to this case yet.</div>}</div></section>}
          {tab === 'Timeline' && <section className="panel"><div className="panel-title">Case activity</div><div className="panel-content timeline-list">{activity.map(item => <div className="timeline-event" key={item.id}><b>{new Date(item.at).toLocaleString()}</b><p>{item.action.replaceAll('_', ' ')} · {item.actor}</p></div>)}{!activity.length && <div className="empty">No activity has been recorded for this case yet.</div>}</div></section>}
          {tab === 'FIR' && <section className="panel"><div className="panel-title">FIR drafts <Link className="btn primary" to={`/filing?case=${encodeURIComponent(c.id)}`}>Create draft</Link></div><div className="panel-content">{drafts.map(draft => <div className="evidence-row" key={draft.id}><div><b>{draft.status.replaceAll('_', ' ')}</b><div className="small muted">Created {new Date(draft.createdAt).toLocaleString()} by {draft.createdBy}</div><p>{draft.statement}</p></div><Link className="btn" to={`/filing?case=${encodeURIComponent(c.id)}&draft=${encodeURIComponent(draft.id)}`}>Review draft</Link></div>)}{!drafts.length && <div className="empty">No FIR drafts are saved for this case.</div>}</div></section>}
        </>}
      </div>
    </WorkspaceShell>
  );
}
