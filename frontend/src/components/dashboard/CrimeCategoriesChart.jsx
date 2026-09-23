import React from 'react';

export default function CrimeCategoriesChart() {
  return (
    <div>
      <h3 className="panel-title">Crime Categories Breakdown</h3>
      <div className="chart-placeholder">
        {/* Geometric chart representation (CSS only for now) */}
        <div className="chart-bar" style={{ height: '70%' }} data-label="Theft"></div>
        <div className="chart-bar" style={{ height: '45%' }} data-label="Fraud"></div>
        <div className="chart-bar" style={{ height: '85%' }} data-label="Cyber"></div>
        <div className="chart-bar" style={{ height: '30%' }} data-label="Assault"></div>
        <div className="chart-bar" style={{ height: '60%' }} data-label="Narcotics"></div>
      </div>
    </div>
  );
}
