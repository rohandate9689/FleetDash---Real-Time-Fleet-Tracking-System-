// Dashboard.jsx
// The main overview page. Layout (Sidebar + Navbar) is handled by the
// parent <Layout /> route wrapper — this component only renders content.

import { useState, useEffect } from 'react';

import '../styles/dashboard.css';
import socket from '../socket';

import DashboardCards from '../components/dashboard/DashboardCards';
import LiveMap        from '../components/map/LiveMap';
import VehicleTable   from '../components/vehicles/VehicleTable';
import AlertPanel     from '../components/alerts/AlertPanel';

import { getVehicles, getAlerts } from '../services/api';

function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [alerts,   setAlerts]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const vehicleData = await getVehicles();
      setVehicles(vehicleData);
      const alertData = await getAlerts();
      setAlerts(alertData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    socket.connect();

    socket.on('connect', () => console.log('🟢 Socket Connected:', socket.id));

    socket.on('telemetry-update', (telemetry) => {
      setVehicles((prev) =>
        prev.map((v) =>
          v.vehicleId !== telemetry.vehicleId
            ? v
            : {
                ...v,
                currentLocation: { latitude: telemetry.latitude, longitude: telemetry.longitude },
                speed:     telemetry.speed,
                fuel:      telemetry.fuel,
                updatedAt: telemetry.timestamp,
              }
        )
      );
    });

    socket.on('new-alert', (alert) => {
      setAlerts((prev) => [alert, ...prev]);
    });

    return () => {
      socket.off('telemetry-update');
      socket.off('new-alert');
      socket.disconnect();
    };
  }, []);

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-heading">Dashboard</h1>
          <p className="page-subheading">Fleet Telemetry Overview</p>
        </div>
        <span className="page-header-badge">Live View</span>
      </div>

      {/* Dashboard sections — identical to original */}
      <DashboardCards vehicles={vehicles} alerts={alerts} loading={loading} error={error} />
      <LiveMap vehicles={vehicles} />
      <VehicleTable vehicles={vehicles} loading={loading} error={error} />
      <AlertPanel alerts={alerts} />
    </>
  );
}

export default Dashboard;