import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

const NAV_ITEMS = [
  { to: '/',              icon: '⊞', label: 'DASH',         exact: true },
  { to: '/tasks',         icon: '◈', label: 'TASKS',        roles: ['coordinator','volunteer'] },
  { to: '/dashboard',     icon: '◉', label: 'DEPLOY',       roles: ['coordinator','volunteer'] },
  { to: '/leaderboard',   icon: '♦', label: 'RANKS',        roles: ['coordinator','volunteer'] },
  { to: '/analytics',     icon: '⊹', label: 'INTEL',        roles: ['coordinator'] },
  { to: '/resources',     icon: '◫', label: 'LOGISTICS',    roles: ['coordinator'] },
  { to: '/beneficiaries', icon: '♡', label: 'AID LOG',      roles: ['coordinator'] },
  { to: '/report',        icon: '⚑', label: 'REPORT',       public: true },
  { to: '/crisis',        icon: '⚠', label: 'CRISIS',       roles: ['coordinator'], crisis: true },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { lastEvent } = useSocket();
  const [crisisActive, setCrisisActive] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    api.get('/crisis/status')
      .then((res) => setCrisisActive(res.data?.active ?? false))
      .catch(() => {});
  }, [user, lastEvent?.timestamp]);

  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.public) return true;
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <span className="sidebar__logo-mark">VS</span>
      </div>

      {/* Nav Items */}
      <nav className="sidebar__nav">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `sidebar__item${isActive ? ' sidebar__item--active' : ''}${item.crisis && crisisActive ? ' sidebar__item--crisis' : ''}`
            }
          >
            <span className="sidebar__icon">{item.icon}</span>
            <span className="sidebar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="sidebar__bottom">
        <button className="sidebar__item" onClick={() => setProfileOpen(!profileOpen)}>
          <span className="sidebar__icon sidebar__icon--avatar">
            {user ? user.name.charAt(0).toUpperCase() : '?'}
          </span>
          <span className="sidebar__label">PROFILE</span>
        </button>

        {profileOpen && user && (
          <div className="sidebar__profile-popup">
            <div className="sidebar__profile-name">{user.name}</div>
            <div className="sidebar__profile-role">{user.role.toUpperCase()}</div>
            <button className="sidebar__logout" onClick={() => { logout(); setProfileOpen(false); }}>
              LOGOUT
            </button>
          </div>
        )}

        {!user && (
          <button className="sidebar__item" onClick={() => navigate('/login')}>
            <span className="sidebar__icon">→</span>
            <span className="sidebar__label">LOGIN</span>
          </button>
        )}
      </div>
    </aside>
  );
}
