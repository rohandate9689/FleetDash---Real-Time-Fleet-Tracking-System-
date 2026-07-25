// Layout.jsx
// Persistent shell rendered around every page route.
// Contains Sidebar + main area (Navbar + Outlet).
// Dashboard page content renders via <Outlet />.

import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import '../../styles/dashboard.css';

const PAGE_TITLES = {
  '/':          'Dashboard',
  '/vehicles':  'Vehicles',
  '/tracking':  'Live Tracking',
  '/alerts':    'Alerts',
  '/reports':   'Reports',
  '/geofences': 'Geofences',
  '/settings':  'Settings',
};

function Layout() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? 'FleetDash';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Navbar title={title} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
