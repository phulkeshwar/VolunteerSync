import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

function navClass({ isActive }) {
  return isActive ? 'nav-link nav-link--active' : 'nav-link';
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lastEvent } = useSocket();
  const [crisisActive, setCrisisActive] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get('/crisis/status')
      .then((res) => setCrisisActive(res.data?.active ?? false))
      .catch(() => {});
  }, [user, lastEvent?.timestamp]);

  return (
    <header className={`nav-shell${crisisActive ? ' nav-shell--crisis' : ''}`}>
      <div className="container nav">
        <NavLink to="/" className="brand">
          <span className="brand__mark">VS</span>
          <span>
            <strong>VolunteerSync</strong>
            <small>Smart volunteer allocation</small>
          </span>
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>

          {user && (
            <>
              <NavLink to="/dashboard" className={navClass}>
                Dashboard
              </NavLink>
              <NavLink to="/tasks" className={navClass}>
                Tasks
              </NavLink>
              <NavLink to="/leaderboard" className={navClass}>
                🏆 Leaderboard
              </NavLink>
            </>
          )}

          {user?.role === 'coordinator' && (
            <>
              <NavLink to="/analytics" className={navClass}>
                Analytics
              </NavLink>
              <NavLink to="/resources" className={navClass}>
                📦 Resources
              </NavLink>
              <NavLink
                to="/crisis"
                className={({ isActive }) =>
                  `nav-link${isActive ? ' nav-link--active' : ''}${crisisActive ? ' nav-link--crisis' : ''}`
                }
              >
                {crisisActive ? '🚨 CRISIS' : '🚨 Crisis'}
              </NavLink>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <div className="user-chip">
                <span>{user.name}</span>
                <small>{user.role}</small>
              </div>
              <button type="button" className="btn btn--ghost" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
              <NavLink to="/register" className="btn btn--primary">
                Get Started
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
