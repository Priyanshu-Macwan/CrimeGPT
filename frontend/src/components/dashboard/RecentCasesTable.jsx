import React from 'react';
import { Eye } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

export default function RecentCasesTable({ cases = [], loading = false }) {
  const navigate = useNavigate();
  return (
    <div className="data-table-container">
      <h3 className="panel-title">Recent Cases</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>CASE ID</th>
            <th>CRIME TYPE</th>
            <th>DATE</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {cases.slice(0, 5).map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.type === 'Other' ? c.otherCrimeType : c.type}</td>
              <td>{new Date(`${c.date}T12:00:00`).toLocaleDateString()}</td>
              <td>
                <span className={`status-tag ${c.status === 'Solved' ? 'solved' : c.status === 'Open' ? 'open' : 'pending'}`}>
                  {c.status.toUpperCase()}
                </span>
              </td>
              <td>
                <button className="action-btn" onClick={() => navigate(`/cases/${c.id}`)} aria-label={`Open ${c.id}`}>
                  <Eye weight="regular" />
                </button>
              </td>
            </tr>
          ))}
          {!cases.length && <tr><td colSpan="5">{loading ? 'Loading cases…' : 'No case records yet.'}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
