import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlass, Plus, ArrowUpRight } from '@phosphor-icons/react';
import WorkspaceShell from '../WorkspaceShell';
import { useRemoteData } from '../../useRemoteData';

const tabs = ['All cases', 'Open', 'Investigating', 'Review', 'Solved'];
function badge(status) {
  return <span className={`stamp ${status === 'Open' || status === 'Review' ? 'red' : status === 'Solved' ? '' : 'neutral'}`}>{status}</span>;
}

export default function MyCases() {
  const { data, loading, error, refresh } = useRemoteData('/cases', 'cases');
  const cases = data || [];
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All cases');
  const [sort, setSort] = useState('Newest');
  const shown = useMemo(() => cases
    .filter(item => (filter === 'All cases' || item.status === filter)
      && `${item.id} ${item.title} ${item.type} ${item.location} ${item.victim}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === 'Newest' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)),
  [cases, filter, query, sort]);

  return (
    <WorkspaceShell title="CASE FILES">
      <div className="work-body">
        <div className="page-heading">
          <div><div className="eyebrow">Records / Officer view</div><h1>My cases</h1><p>Case files assigned to your unit, ready for review and action.</p></div>
          <Link className="btn primary" to="/new-case"><Plus /> Register case</Link>
        </div>
        <div className="card-grid">
          {[
            ['TOTAL FILES', cases.length], ['OPEN', cases.filter(item => item.status === 'Open').length],
            ['IN PROGRESS', cases.filter(item => item.status === 'Investigating').length],
            ['CLOSED', cases.filter(item => item.status === 'Solved').length],
          ].map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{String(value).padStart(2, '0')}</strong></div>)}
        </div>
        <div className="filters">{tabs.map(tab => <button key={tab} onClick={() => setFilter(tab)} className={`filter-button ${filter === tab ? 'active' : ''}`}>{tab} {tab === 'All cases' ? `(${cases.length})` : ''}</button>)}</div>
        <section className="panel">
          <div className="panel-title"><span>Case register</span><span className="muted small">{loading ? 'LOADING…' : `${shown.length} RECORDS`}</span></div>
          <div className="panel-content">
            <div className="toolbar">
              <div className="search-bar"><MagnifyingGlass /><input className="field" placeholder="Search case ID, title, person…" value={query} onChange={event => setQuery(event.target.value)} /></div>
              <select className="select" style={{ width: 'auto' }} value={sort} onChange={event => setSort(event.target.value)}><option>Newest</option><option>Oldest</option></select>
            </div>
            {error && <div className="form-error" role="alert">Could not load cases: {error} <button className="btn" onClick={() => refresh().catch(() => {})}>Retry</button></div>}
            <div className="table-wrap"><table className="work-table"><thead><tr><th>Case ID / Title</th><th>Type</th><th>Date</th><th>Location</th><th>Status</th><th>Priority</th><th></th></tr></thead>
              <tbody>{shown.map(item => <tr key={item.id}>
                <td><Link className="table-link" to={`/cases/${item.id}`}>{item.title}</Link><div className="muted small">{item.id}</div></td>
                <td>{item.type === 'Other' ? item.otherCrimeType : item.type}</td>
                <td>{new Date(`${item.date}T12:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>{item.location}</td><td>{badge(item.status)}</td><td>{item.priority}</td>
                <td><Link to={`/cases/${item.id}`} aria-label={`Open ${item.id}`}><ArrowUpRight /></Link></td>
              </tr>)}</tbody>
            </table>{!loading && !error && !shown.length && <div className="empty">No matching case files. Try another search or register a case.</div>}</div>
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
