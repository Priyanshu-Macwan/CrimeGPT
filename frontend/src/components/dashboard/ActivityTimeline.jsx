import React from 'react';

export default function ActivityTimeline({ activity = [] }) {
  return (
    <div>
      <h3 className="panel-title">Recent Activity</h3>
      <div className="timeline-log">
        {activity.slice(0, 10).map((log) => (
          <div className="timeline-item" key={log.id}>
            <div className="timeline-time">{new Date(log.at).toLocaleString()}</div>
            <div className="timeline-content">{log.actor} · {log.action.replaceAll('_', ' ')} · {log.target}</div>
          </div>
        ))}
        {!activity.length && <p className="empty">No activity has been recorded yet.</p>}
      </div>
    </div>
  );
}
