import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import WorkspaceShell from '../WorkspaceShell';
import { MagnifyingGlass, Printer, DownloadSimple } from '@phosphor-icons/react';
import { useRemoteData } from '../../useRemoteData';

export default function ReportsPage() {
  const { data, loading, error } = useRemoteData('/cases', 'cases');
  const { data: draftData } = useRemoteData('/drafts', 'drafts');
  const cases = data || [];
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [from, setFrom] = useState('2024-10-01');
  const [to, setTo] = useState('2024-10-31');
  const [precinct, setPrecinct] = useState('All units');
  const reports = useMemo(() => cases.map(item => ({
    id: `RPT-${item.id}`,
    title: `${item.type === 'Other' ? item.otherCrimeType : item.type} case report — ${item.id}`,
    case: item,
    date: item.date,
    owner: item.officer,
    status: item.status,
  })).filter(report => `${report.id} ${report.title} ${report.case.id}`.toLowerCase().includes(query.toLowerCase())), [cases, query]);
  const generate = () => setSelected({ id: `RPT-MONTH-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`, title: 'Monthly precinct summary', date: to, owner: 'Central Precinct', status: 'Generated', summary: true });
  const summaryCases = cases.filter(item => item.date >= from && item.date <= to && (precinct === 'All units' || item.precinct === precinct));

  return (
    <WorkspaceShell title="REPORTS">
      <div className="work-body">
        <div className="page-heading"><div><div className="eyebrow">Records / Reporting</div><h1>Reports & analytics</h1><p>Prepare precinct summaries from the case records stored by the backend.</p></div></div>
        <section className="panel"><div className="panel-title">Monthly report parameters</div><div className="panel-content"><div className="form-grid">
          <Field label="Date from"><input type="date" className="field" value={from} onChange={event => setFrom(event.target.value)} /></Field>
          <Field label="Date to"><input type="date" className="field" value={to} onChange={event => setTo(event.target.value)} /></Field>
          <Field label="Precinct / unit"><select className="select" value={precinct} onChange={event => setPrecinct(event.target.value)}><option>All units</option><option>7B</option><option>Central</option></select></Field>
          <div style={{ display: 'flex', alignItems: 'end' }}><button className="btn primary" onClick={generate}><Printer /> Generate monthly report</button></div>
        </div></div></section>
        <div className="card-grid">{[['TOTAL CASES', cases.length], ['OPEN', cases.filter(item => item.status === 'Open').length], ['SOLVED', cases.filter(item => item.status === 'Solved').length], ['AI DRAFTS', (draftData || []).filter(item => item.status === 'pending_review').length]].map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{String(value).padStart(2, '0')}</strong></div>)}</div>
        <div className="toolbar"><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MagnifyingGlass /><input className="field" placeholder="Search report or case…" value={query} onChange={event => setQuery(event.target.value)} /></div></div>
        <section className="panel"><div className="panel-title">Case report index <span className="small muted">{loading ? 'LOADING…' : `${reports.length} RECORDS`}</span></div>
          {error && <p className="form-error" role="alert">Could not load reports: {error}</p>}
          <div className="table-wrap"><table className="work-table"><thead><tr><th>Report ID</th><th>Report</th><th>Case</th><th>Date</th><th>Prepared by</th><th>Status</th><th /></tr></thead><tbody>
            {reports.map(report => <tr key={report.id}><td>{report.id}</td><td><b>{report.title}</b></td><td><Link className="table-link" to={`/cases/${report.case.id}`}>{report.case.id}</Link></td><td>{report.date}</td><td>{report.owner}</td><td><span className="stamp neutral">{report.status}</span></td><td><button className="btn" onClick={() => setSelected(report)}>Preview</button></td></tr>)}
          </tbody></table>{!loading && !error && !reports.length && <div className="empty">No case reports are available yet.</div>}</div>
        </section>
      </div>
      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section className="modal" style={{ width: 'min(760px,100%)' }} onClick={event => event.stopPropagation()}>
        <div className="modal-head"><h2>Report preview</h2><button className="icon-button" onClick={() => setSelected(null)}>×</button></div><div className="eyebrow">{selected.id} · {selected.date}</div><h2>{selected.title}</h2>
        <div className="card-grid">{[['CASES', selected.summary ? summaryCases.length : 1], ['OPEN', (selected.summary ? summaryCases : [selected.case]).filter(item => item?.status === 'Open').length], ['SOLVED', (selected.summary ? summaryCases : [selected.case]).filter(item => item?.status === 'Solved').length], ['UNIT', precinct]].map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
        <div className="panel"><div className="panel-title">Included case files</div><div className="table-wrap"><table className="work-table"><thead><tr><th>Case</th><th>Type</th><th>Status</th><th>Officer</th></tr></thead><tbody>{(selected.summary ? summaryCases : [selected.case]).filter(Boolean).map(item => <tr key={item.id}><td>{item.id} · {item.title}</td><td>{item.type}</td><td>{item.status}</td><td>{item.officer}</td></tr>)}</tbody></table></div></div>
        <p className="notice" style={{ marginTop: 16 }}>Summary period: {from} to {to}. This preview is built from backend case data; the backend does not yet store generated report files.</p>
        <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 16 }}><button className="btn" onClick={() => window.print()}><Printer /> Print</button><button className="btn primary" onClick={() => window.print()}><DownloadSimple /> Print / Save PDF</button></div>
      </section></div>}
    </WorkspaceShell>
  );
}

function Field({ label, children }) { return <div className="form-field"><label>{label}</label>{children}</div>; }
