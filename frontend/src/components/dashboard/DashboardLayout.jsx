import React from 'react';
import { Link } from 'react-router-dom';
import WorkspaceShell from '../WorkspaceShell';
import { useApi } from '../../useApi';

export default function DashboardLayout() {
  const { data: casesData, error: casesError } = useApi('/cases');
  const { data: draftData, error: draftError } = useApi('/drafts');
  const { data: activityData } = useApi('/activity');
  const cases = casesData?.cases || [];
  const drafts = draftData?.drafts || [];
  const counts = Object.entries(cases.reduce((result, item) => ({ ...result, [item.type]: (result[item.type] || 0) + 1 }), {}));
  return <WorkspaceShell title="DASHBOARD"><div className="work-body">
    <div className="page-heading"><div><div className="eyebrow">Officer workspace</div><h1>Dashboard</h1><p>Current case records and draft activity.</p></div><Link className="btn primary" to="/new-case">+ New case</Link></div>
    {(casesError || draftError) && <p className="form-error" role="alert">{casesError || draftError}</p>}
    <div className="card-grid">{[['TOTAL CASES', cases.length], ['OPEN CASES', cases.filter(c => c.status === 'Open').length], ['SOLVED CASES', cases.filter(c => c.status === 'Solved').length], ['DRAFTS PENDING', drafts.filter(d => d.status === 'pending_review').length]].map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{String(value).padStart(2, '0')}</strong></div>)}</div>
    <div className="two-col"><section className="panel"><div className="panel-title">Recent cases</div><div className="panel-content">{cases.slice(0, 8).map(c => <div className="person-row" key={c.id}><div><Link className="table-link" to={`/cases/${c.id}`}>{c.title}</Link><div className="small muted">{c.id} · {c.date} · {c.type}</div></div><span className="stamp">{c.status}</span></div>)}{!cases.length && <p>No cases registered yet.</p>}</div></section>
      <section className="panel"><div className="panel-title">Drafts awaiting review</div><div className="panel-content">{drafts.filter(d => d.status === 'pending_review').slice(0, 8).map(d => <div className="person-row" key={d.id}><div><b>{d.caseId}</b><div className="small muted">{d.createdAt}</div></div><Link className="btn" to={`/filing?caseId=${d.caseId}`}>Review</Link></div>)}{!drafts.some(d => d.status === 'pending_review') && <p>No drafts awaiting review.</p>}</div></section></div>
    <div className="two-col"><section className="panel"><div className="panel-title">Case categories</div><div className="panel-content">{counts.map(([type, count]) => <p key={type}>{type}: <b>{count}</b></p>)}{!counts.length && <p>No case data yet.</p>}</div></section><section className="panel"><div className="panel-title">Recent activity</div><div className="panel-content">{(activityData?.activity || []).slice(0, 8).map(item => <p key={item.id}>{item.at} · {item.actor} · {item.action.replace('_', ' ')} · {item.target}</p>)}{!activityData?.activity?.length && <p>No activity recorded yet.</p>}</div></section></div>
  </div></WorkspaceShell>;
}
