import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import WorkspaceShell from '../WorkspaceShell';
import { useApi } from '../../useApi';
import { filterCases } from '../../reporting';
const EMPTY_CASES = [];

export default function AdminPage() {
  const { data, error } = useApi('/admin/overview');
  const cases = data?.cases || EMPTY_CASES;
  const drafts = data?.drafts || [];
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [unit, setUnit] = useState('All units');
  const rows = useMemo(() => filterCases(cases, from, to, unit), [cases, from, to, unit]);
  return <WorkspaceShell title="ADMIN OVERVIEW"><div className="work-body">
    <div className="page-heading"><div><div className="eyebrow">Station administration</div><h1>Precinct performance</h1><p>Case and officer workload for administrators.</p></div></div>
    {error && <p role="alert" className="form-error">{error}</p>}
    <div className="toolbar"><label>From <input className="field" type="date" value={from} onChange={e => setFrom(e.target.value)}/></label><label>To <input className="field" type="date" value={to} onChange={e => setTo(e.target.value)}/></label><label>Unit <select className="select" value={unit} onChange={e => setUnit(e.target.value)}>{['All units', ...new Set(cases.map(c => c.precinct))].map(value => <option key={value}>{value}</option>)}</select></label></div>
    {from && to && from > to && <p role="alert" className="form-error">The start date must be before the end date.</p>}
    <div className="card-grid">{[['CASES', rows.length], ['ACTIVE', rows.filter(c => c.status === 'Open' || c.status === 'Investigating').length], ['SOLVED', rows.filter(c => c.status === 'Solved').length], ['OFFICERS', new Set(rows.map(c => c.officer)).size], ['DRAFTS', drafts.filter(d => rows.some(c => c.id === d.caseId)).length]].map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <div className="two-col"><section className="panel"><div className="panel-title">Officer workload</div><div className="table-wrap"><table className="work-table"><thead><tr><th>Officer</th><th>Assigned</th><th>Open</th><th>Solved</th></tr></thead><tbody>{[...new Set(rows.map(c => c.officer))].map(name => { const own = rows.filter(c => c.officer === name); return <tr key={name}><td>{name}</td><td>{own.length}</td><td>{own.filter(c => c.status === 'Open').length}</td><td>{own.filter(c => c.status === 'Solved').length}</td></tr>; })}</tbody></table></div></section>
      <section className="panel"><div className="panel-title">Cases in range</div><div className="panel-content">{rows.map(c => <div className="person-row" key={c.id}><Link className="table-link" to={`/cases/${c.id}`}>{c.id} · {c.title}</Link><span>{c.status}</span></div>)}{!rows.length && <p>No cases in range.</p>}</div></section></div>
  </div></WorkspaceShell>;
}
