// Navbar.jsx
// Top navigation bar. Accepts a dynamic `title` prop from Layout.

import '../../styles/navbar.css';

function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function Navbar({ title = 'Dashboard' }) {
  return (
    <header className="navbar">

      <div className="navbar-left">
        <span className="navbar-page-title">{title}</span>
      </div>

      <div className="navbar-right">

        <div className="navbar-search">
          <IconSearch />
          <input
            type="text"
            placeholder="Search vehicles, drivers..."
            aria-label="Search"
          />
        </div>

        <div className="navbar-divider" />

        <button className="navbar-icon-btn" aria-label="Notifications">
          <IconBell />
          <span className="notif-dot" />
        </button>

        <div className="navbar-divider" />

        <div className="navbar-user" role="button" tabIndex={0} aria-label="User profile">
          <div className="navbar-avatar">AD</div>
          <div className="navbar-user-info">
            <span className="navbar-username">Admin</span>
            <span className="navbar-role">Fleet Manager</span>
          </div>
        </div>

      </div>
    </header>
  );
}

export default Navbar;
