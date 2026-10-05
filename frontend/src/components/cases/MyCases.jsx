import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlass, Plus } from '@phosphor-icons/react';
import WorkspaceShell from '../WorkspaceShell';
import { useApi } from '../../useApi';
import { caseTypeLabel } from '../../caseType';

const tabs = ['All cases', 'Open', 'Investigating', 'Review', 'Solved'];
const EMPTY_CASES = [];
export default function MyCases() {
  const { data, error, loading } = useApi('/cases');
  const cases = data?.cases || EMPTY_CASES;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All cases');
  const [sort, setSort] = useState('Newest');
  const shown = useMemo(() => cases.filter(c =>
    (filter === 'All cases' || c.status === filter) &&
    [c.id, c.title, caseTypeLabel(c), c.location, c.victim].join(' ').toLowerCase().includes(query.toLowerCase())
  ).sort((a, b) => sort === 'Newest' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)), [cases, query, filter, sort]);
  return <WorkspaceShell title="CASE FILES"><div className="work-body">
    <div className="page-heading"><div><div className="eyebrow">Records / Officer view</div><h1>My cases</h1><p>Case files available to your unit.</p></div><Link className="btn primary" to="/new-case"><Plus/> Register case</Link></div>
    {error && <p role="alert" className="form-error">{error}</p>}
    {loading && <p>Loading cases…</p>}
    <div className="card-grid">{[['TOTAL FILES', cases.length], ['OPEN', cases.filter(c => c.status === 'Open').length], ['IN PROGRESS', cases.filter(c => c.status === 'Investigating').length], ['SOLVED', cases.filter(c => c.status === 'Solved').length]].map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{String(value).padStart(2, '0')}</strong></div>)}</div>
    <div className="filters">{tabs.map(tab => <button key={tab} className={`filter-button ${filter === tab ? 'active' : ''}`} onClick={() => setFilter(tab)}>{tab}</button>)}</div>
    <section className="panel"><div className="panel-title">Case register <span className="muted small">{shown.length} RECORDS</span></div><div className="panel-content">
      <div className="toolbar"><div className="search-bar"><MagnifyingGlass/><input className="field" placeholder="Search case ID, title, person…" value={query} onChange={e => setQuery(e.target.value)}/></div><select className="select" value={sort} onChange={e => setSort(e.target.value)}><option>Newest</option><option>Oldest</option></select></div>
      <div className="table-wrap"><table className="work-table"><thead><tr><th>Case ID / Title</th><th>Type</th><th>Date</th><th>Location</th><th>Status</th><th>Officer</th></tr></thead><tbody>{shown.map(c => <tr key={c.id}><td><Link className="table-link" to={`/cases/${c.id}`}>{c.title}</Link><div className="muted small">{c.id}</div></td><td>{caseTypeLabel(c)}</td><td>{c.date}</td><td>{c.location}</td><td><span className="stamp">{c.status}</span></td><td>{c.officer}</td></tr>)}</tbody></table>{!loading && !shown.length && <div className="empty">No matching case files.</div>}</div>
    </div></section>
  </div></WorkspaceShell>;
}
