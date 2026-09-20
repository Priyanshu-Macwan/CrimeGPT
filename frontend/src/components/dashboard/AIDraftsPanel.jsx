import React from 'react';

const mockDrafts = [
  { title: 'FIR Draft: Cyber Fraud', time: 'Generated 10m ago' },
  { title: 'Statement Summary: CR-889', time: 'Generated 1h ago' },
];

export default function AIDraftsPanel() {
  return (
    <div className="ai-drafts-panel">
      <h3 className="panel-title">AI Drafts Awaiting Review</h3>
      
      {mockDrafts.map((draft, idx) => (
        <div className="draft-card" key={idx}>
          <div className="draft-header">
            <span className="draft-title">{draft.title}</span>
            <span className="draft-time">{draft.time}</span>
          </div>
          <button className="btn-review">REVIEW NOW</button>
        </div>
      ))}
    </div>
  );
}
