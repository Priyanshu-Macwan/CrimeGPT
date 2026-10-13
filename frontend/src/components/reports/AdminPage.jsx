import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import WorkspaceShell from '../WorkspaceShell';
import { Printer, ArrowUpRight } from '@phosphor-icons/react';
import { request } from '../../api';

export default function AdminPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [start, setStart] = useState('2024-01-01');
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));
  const [unit, setUnit] = useState('All units');
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    let active = true;
    request('/admin/overview')
      .then(result => { if (active) setOverview(result); })
      .catch(loadError => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const cases = overview?.cases || [];
  const drafts = overview?.drafts || [];
  const rows = useMemo(() => cases.filter(item => (unit === 'All units' || item.precinct === unit) && item.date >= start && item.date <= end), [cases, unit, start, end]);
  const officers = [...new Set(rows.map(item => item.officer))];

  return (
    <WorkspaceShell title="SYSTEM LOG">
      <div className="work-body">
        <div className="page-heading"><div><div className="eyebrow">Station administration / Overview</div><h1>Precinct performance</h1><p>Station-wide case activity and officer workload, for authorized administrators.</p></div></div>
        {error && <div className="form-error" role="alert">Could not load the admin overview: {error} <button className="btn" onClick={() => window.location.reload()}>Retry</button></div>}
        <section className="panel"><div className="panel-content"><div className="form-grid">
          <Field label="Date range · from"><input className="field" type="date" value={start} onChange={event => setStart(event.target.value)} /></Field>
          <Field label="Date range · to"><input className="field" type="date" value={end} onChange={event => setEnd(event.target.value)} /></Field>
          <Field label="Precinct / unit"><select className="select" value={unit} onChange={event => setUnit(event.target.value)}><option>All units</option><option>7B</option><option>Central</option></select></Field>
          <div style={{ display: 'flex', alignItems: 'end' }}><button className="btn primary" onClick={() => setGenerated(true)}><Printer /> Generate monthly report</button></div>
        </div>{generated && <p className="small">Report parameters applied · {rows.length} backend records in selected range.</p>}</div></section>
        <div className="card-grid">{[['TOTAL CASES', rows.length], ['ACTIVE', rows.filter(item => item.status === 'Open' || item.status === 'Investigating').length], ['SOLVED', rows.filter(item => item.status === 'Solved').length], ['OFFICERS', officers.length], ['AI DRAFTS', drafts.length]].map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{loading ? '…' : String(value).padStart(2, '0')}</strong></div>)}</div>
        <div className="two-col">
          <section className="panel"><div className="panel-title">Officer workload</div><div className="table-wrap"><table className="work-table"><thead><tr><th>Officer</th><th>Assigned cases</th><th>Open</th><th>Solved</th></tr></thead><tbody>{officers.map(name => { const own = rows.filter(item => item.officer === name); return <tr key={name}><td><b>{name}</b></td><td>{own.length}</td><td>{own.filter(item => item.status === 'Open' || item.status === 'Investigating').length}</td><td>{own.filter(item => item.status === 'Solved').length}</td></tr>; })}{!loading && !rows.length && <tr><td colSpan="4">No records for this range.</td></tr>}</tbody></table></div></section>
          <section className="panel"><div className="panel-title">Recent station cases</div><div className="panel-content">{rows.slice(0, 5).map(item => <div className="person-row" key={item.id}><div><Link className="table-link" to={`/cases/${item.id}`}>{item.title}</Link><div className="small muted">{item.id} · {item.officer}</div></div><span className={`stamp ${item.status === 'Open' ? 'red' : 'neutral'}`}>{item.status}</span><Link to={`/cases/${item.id}`} aria-label={`Open ${item.id}`}><ArrowUpRight /></Link></div>)}{!loading && !rows.length && <div className="empty">No cases in the selected date range.</div>}</div></section>
        </div>
      </div>
    </WorkspaceShell>
  );
}

function Field({ label, children }) { return <div className="form-field"><label>{label}</label>{children}</div>; }
