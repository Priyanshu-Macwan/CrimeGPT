import React from 'react';

const mockLogs = [
  { time: '10:42 AM', action: 'Reviewed FIR Draft: Cyber Fraud' },
  { time: '09:15 AM', action: 'Updated status for Case CR-2026-885 to SOLVED' },
  { time: '08:30 AM', action: 'Logged into secure network' },
  { time: 'Yesterday', action: 'Generated evidence summary for CR-2026-891' },
];

export default function ActivityTimeline() {
  return (
    <div>
      <h3 className="panel-title">Recent Activity</h3>
      <div className="timeline-log">
        {mockLogs.map((log, idx) => (
          <div className="timeline-item" key={idx}>
            <div className="timeline-time">{log.time}</div>
            <div className="timeline-content">{log.action}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
