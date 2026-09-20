import React from 'react';

export default function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span>{title}</span>
        <Icon weight="regular" size={24} />
      </div>
      <div className="stat-card-value">
        {value}
      </div>
    </div>
  );
}
