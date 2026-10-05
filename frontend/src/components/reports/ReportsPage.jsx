import React, { useMemo, useState } from 'react';
import WorkspaceShell from '../WorkspaceShell';
import { useApi } from '../../useApi';
import { filterCases } from '../../reporting';
const EMPTY_CASES = [];

export default function ReportsPage() {
  const { data, error } = useApi('/cases');
  const cases = data?.cases || EMPTY_CASES;
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [precinct, setPrecinct] = useState('All units');
  const [generated, setGenerated] = useState(false);
  const units = ['All units', ...new Set(cases.map(c => c.precinct))];
  const rows = useMemo(() => filterCases(cases, from, to, precinct), [cases, from, to, precinct]);
  function update(setter, value) { setter(value); setGenerated(false); }
  return <WorkspaceShell title="REPORTS"><div className="work-body">
    <div className="page-heading"><div><div className="eyebrow">Records / Reporting</div><h1>Case summary</h1><p>Build a summary from recorded cases and print or save it as PDF.</p></div></div>
    {error && <p role="alert" className="form-error">{error}</p>}
    <section className="panel report-parameters"><div className="panel-title">Report parameters</div><div className="panel-content"><div className="form-grid">
      <div className="form-field"><label htmlFor="report-from">From</label><input id="report-from" type="date" className="field" value={from} onChange={e => update(setFrom, e.target.value)}/></div>
      <div className="form-field"><label htmlFor="report-to">To</label><input id="report-to" type="date" className="field" value={to} onChange={e => update(setTo, e.target.value)}/></div>
      <div className="form-field"><label htmlFor="report-unit">Unit</label><select id="report-unit" className="select" value={precinct} onChange={e => update(setPrecinct, e.target.value)}>{units.map(unit => <option key={unit}>{unit}</option>)}</select></div>
      <div className="actions"><button className="btn primary" disabled={Boolean(from && to && from > to)} onClick={() => setGenerated(true)}>Generate summary</button></div>
    </div>{from && to && from > to && <p role="alert" className="form-error">The start date must be before the end date.</p>}</div></section>
    {generated && <section className="panel"><div className="panel-title">Summary · {from || 'Earliest'} to {to || 'Latest'} · {precinct}</div><div className="panel-content">
      <div className="card-grid">{[['CASES', rows.length], ['OPEN', rows.filter(c => c.status === 'Open').length], ['SOLVED', rows.filter(c => c.status === 'Solved').length]].map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      <div className="table-wrap"><table className="work-table"><thead><tr><th>Case</th><th>Date</th><th>Type</th><th>Unit</th><th>Status</th><th>Officer</th></tr></thead><tbody>{rows.map(c => <tr key={c.id}><td>{c.id} · {c.title}</td><td>{c.date}</td><td>{c.type}</td><td>{c.precinct}</td><td>{c.status}</td><td>{c.officer}</td></tr>)}</tbody></table>{!rows.length && <div className="empty">No cases match this period and unit.</div>}</div>
      <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 16 }}><button className="btn primary" onClick={() => window.print()}>Print / Save PDF</button></div>
    </div></section>}
  </div></WorkspaceShell>;
}
