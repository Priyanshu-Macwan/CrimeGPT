import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AIDraftsPanel({ drafts = [], loading = false }) {
  const navigate = useNavigate();
  return (
    <div className="ai-drafts-panel">
      <h3 className="panel-title">AI Drafts Awaiting Review</h3>
      
      {drafts.map((draft) => (
        <div className="draft-card" key={draft.id}>
          <div className="draft-header">
            <span className="draft-title">FIR Draft · {draft.caseId}</span>
            <span className="draft-time">{new Date(draft.createdAt).toLocaleDateString()}</span>
          </div>
          <button className="btn-review" onClick={() => navigate(`/filing?case=${encodeURIComponent(draft.caseId)}&draft=${encodeURIComponent(draft.id)}`)}>REVIEW NOW</button>
        </div>
      ))}
      {!drafts.length && <p className="empty">{loading ? 'Loading drafts…' : 'No drafts are awaiting review.'}</p>}
    </div>
  );
}
