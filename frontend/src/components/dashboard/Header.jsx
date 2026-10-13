import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlass, Bell, Robot, Sparkle } from '@phosphor-icons/react';
import { useAuth } from '../../authContext';
import { useRemoteData } from '../../useRemoteData';

export default function Header() {
  const { user } = useAuth();
  const { data: draftData } = useRemoteData('/drafts', 'drafts');
  const drafts = (draftData || []).filter(draft => draft.status === 'pending_review');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  return (
    <header className="top-header">
      <div className="header-greeting">
        <h2>Welcome, Officer {user?.id || ''}</h2>
        <div className="badge-number">{user?.role?.toUpperCase()}</div>
      </div>
      
      <div className="header-actions">
        <div className="search-bar">
          <MagnifyingGlass weight="bold" />
          <input type="text" placeholder="Search case ID, name..." />
        </div>
        
        <div className="notification-wrap">
        <button className="notification-btn" type="button" aria-label="Notifications" aria-expanded={notificationsOpen} aria-controls="notification-menu" onClick={() => { setNotificationsOpen(open => !open); setHasUnread(false); }}>
          <Bell weight="regular" />
          {hasUnread && drafts.length > 0 && <span className="notification-dot"></span>}
        </button>
        {notificationsOpen && <section className="notification-menu" id="notification-menu" aria-label="Notifications">
          <div className="notification-menu-title"><strong>Pending AI drafts</strong><span>{drafts.length}</span></div>
          {drafts.length ? drafts.slice(0, 4).map(draft => <Link key={draft.id} to={`/filing?draft=${encodeURIComponent(draft.id)}`} onClick={() => setNotificationsOpen(false)}>
            <Sparkle size={16} /><span><strong>{draft.caseId || 'Case draft'}</strong><small>{draft.statement?.slice(0, 72) || 'Review generated FIR draft'}</small></span>
          </Link>) : <p>No pending draft notifications.</p>}
          <Link className="notification-all" to="/filing" onClick={() => setNotificationsOpen(false)}>Open FIR workspace</Link>
        </section>}
        </div>
        
        <div className="header-logo-badge">
          <Robot weight="fill" /> CRIMEGPT
        </div>
      </div>
    </header>
  );
}
