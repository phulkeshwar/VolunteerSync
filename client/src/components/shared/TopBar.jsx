import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';

const PAGE_TITLES = {
  '/':            'MISSION CONTROL',
  '/dashboard':   'MISSION CONTROL',
  '/tasks':       'TASK BOARD',
  '/analytics':   'INTELLIGENCE',
  '/resources':   'LOGISTICS',
  '/crisis':      'CRISIS COMMAND',
  '/leaderboard': 'LEADERBOARD',
  '/login':       'ACCESS',
  '/register':    'ENLIST',
};

export default function TopBar() {
  const { user } = useAuth();
  const { lastEvent } = useSocket();
  const location = useLocation();
  const [crisisActive, setCrisisActive] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    api.get('/crisis/status')
      .then((res) => setCrisisActive(res.data?.active ?? false))
      .catch(() => {});
  }, [user, lastEvent?.timestamp]);

  const title = PAGE_TITLES[location.pathname] || 'MISSION CONTROL';
  const isLive = location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register';

  return (
    <header className="topbar">
      <div className="topbar__left">
        <h1 className="topbar__title">
          {title}
          {isLive && <span className="topbar__live-dot" />}
        </h1>
      </div>

      {user && (
        <div className="topbar__center">
          <div className="topbar__search">
            <span className="topbar__search-icon">⌕</span>
            <input
              className="topbar__search-input"
              placeholder="Search operational data..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="topbar__right">
        {user && (
          <>
            
            {crisisActive ? (
              <button className="topbar__crisis-btn topbar__crisis-btn--active">
                ⚠ CRISIS MODE
              </button>
            ) : null}
          </>
        )}
      </div>
    </header>
  );
}
