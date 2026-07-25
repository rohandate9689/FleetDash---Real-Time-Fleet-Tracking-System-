// App.jsx — Root component with React Router configuration.
// Layout wraps all routes; each sidebar item gets its own page.

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout     from './components/layout/Layout';
import Dashboard  from './pages/Dashboard';
import Vehicles   from './pages/Vehicles';
import LiveTracking from './pages/LiveTracking';
import Alerts     from './pages/Alerts';
import Reports    from './pages/Reports';
import Geofences  from './pages/Geofences';
import Settings   from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index          element={<Dashboard />} />
          <Route path="vehicles"  element={<Vehicles />} />
          <Route path="tracking"  element={<LiveTracking />} />
          <Route path="alerts"    element={<Alerts />} />
          <Route path="reports"   element={<Reports />} />
          <Route path="geofences" element={<Geofences />} />
          <Route path="settings"  element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
