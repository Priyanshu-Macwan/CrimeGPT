import React from 'react';
import { Eye } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

const mockCases = [
  { id: 'CR-2026-892', type: 'Cyber Fraud', date: 'Oct 24, 2026', status: 'open' },
  { id: 'CR-2026-891', type: 'Theft', date: 'Oct 23, 2026', status: 'pending' },
  { id: 'CR-2026-889', type: 'Assault', date: 'Oct 21, 2026', status: 'solved' },
  { id: 'CR-2026-885', type: 'Extortion', date: 'Oct 19, 2026', status: 'solved' },
];

export default function RecentCasesTable() {
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
          {mockCases.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.type}</td>
              <td>{c.date}</td>
              <td>
                <span className={`status-tag ${c.status}`}>
                  {c.status.toUpperCase()}
                </span>
              </td>
              <td>
                <button className="action-btn" onClick={() => navigate('/cases')} aria-label={`Open ${c.id}`}>
                  <Eye weight="regular" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
