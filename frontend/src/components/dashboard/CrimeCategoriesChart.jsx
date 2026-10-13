import React from 'react';

export default function CrimeCategoriesChart({ cases = [] }) {
  const categories = [...new Set(cases.map(item => item.type === 'Other' ? item.otherCrimeType : item.type))]
    .map(label => ({ label, count: cases.filter(item => (item.type === 'Other' ? item.otherCrimeType : item.type) === label).length }))
    .sort((a, b) => b.count - a.count).slice(0, 5);
  const max = Math.max(...categories.map(item => item.count), 1);
  return (
    <div>
      <h3 className="panel-title">Crime Categories Breakdown</h3>
      <div className="chart-placeholder">
        {categories.map(item => <div className="chart-bar" key={item.label} style={{ height: `${Math.max(18, item.count / max * 85)}%` }} data-label={`${item.label} (${item.count})`} />)}
        {!categories.length && <p className="empty">Crime categories will appear as cases are registered.</p>}
      </div>
    </div>
  );
}
