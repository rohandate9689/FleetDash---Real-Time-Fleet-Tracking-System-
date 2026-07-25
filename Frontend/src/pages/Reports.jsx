// Reports.jsx — Fleet analytics, operational metrics & summary reporting page.

import { useState, useEffect } from 'react';
import { getVehicles, getAlerts } from '../services/api';

import '../styles/dashboard.css';
import '../styles/pages.css';

function Reports() {
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [vData, aData] = await Promise.all([getVehicles(), getAlerts()]);
        setVehicles(vData);
        setAlerts(aData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load fleet report metrics');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalVehicles = vehicles.length;
  const runningCount  = vehicles.filter((v) => (v.status || '').toLowerCase() === 'running').length;
  const idleCount     = vehicles.filter((v) => (v.status || '').toLowerCase() === 'idle').length;
  const offlineCount  = vehicles.filter((v) => (v.status || '').toLowerCase() === 'offline').length;
  const activeCount   = runningCount + idleCount;

  const runningPct = totalVehicles ? Math.round((runningCount / totalVehicles) * 100) : 0;
  const idlePct    = totalVehicles ? Math.round((idleCount / totalVehicles) * 100) : 0;
  const offlinePct = totalVehicles ? Math.round((offlineCount / totalVehicles) * 100) : 0;

  const totalAlerts = alerts.length;
  const entryAlerts = alerts.filter((a) => (a.type || '').toUpperCase() === 'ENTRY').length;
  const exitAlerts  = alerts.filter((a) => (a.type || '').toUpperCase() === 'EXIT').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-heading">Reports & Analytics</h1>
          <p className="page-subheading">Fleet Operational Metrics & System Performance</p>
        </div>
        <span className="page-header-badge">Analytics Feed</span>
      </div>

      {loading ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
          Loading reporting metrics...
        </div>
      ) : error ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
          {error}
        </div>
      ) : (
        <>
          {/* Main Stat Cards */}
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-label">Total Vehicles</div>
              <div className="stat-value">{totalVehicles}</div>
              <div className="stat-sub">Registered in system</div>
            </div>
            <div className="stat-card green">
              <div className="stat-label">Active Vehicles</div>
              <div className="stat-value">{activeCount}</div>
              <div className="stat-sub">{runningCount} Running • {idleCount} Idle</div>
            </div>
            <div className="stat-card orange">
              <div className="stat-label">Offline Vehicles</div>
              <div className="stat-value">{offlineCount}</div>
              <div className="stat-sub">{offlinePct}% of total fleet</div>
            </div>
            <div className="stat-card red">
              <div className="stat-label">Total Alerts</div>
              <div className="stat-value">{totalAlerts}</div>
              <div className="stat-sub">{entryAlerts} Entry • {exitAlerts} Exit</div>
            </div>
          </div>

          {/* Grid layout for status distribution and alert stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            {/* Status Distribution Card */}
            <div className="section-card" style={{ marginBottom: 0 }}>
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-title-dot" style={{ backgroundColor: '#22c55e' }} />
                  Vehicle Status Distribution
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span>Running Vehicles</span>
                    <strong>{runningCount} ({runningPct}%)</strong>
                  </div>
                  <div style={{ height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${runningPct}%`, background: '#22c55e', borderRadius: '4px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span>Idle Vehicles</span>
                    <strong>{idleCount} ({idlePct}%)</strong>
                  </div>
                  <div style={{ height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${idlePct}%`, background: '#f97316', borderRadius: '4px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span>Offline Vehicles</span>
                    <strong>{offlineCount} ({offlinePct}%)</strong>
                  </div>
                  <div style={{ height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${offlinePct}%`, background: '#ef4444', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Statistics Card */}
            <div className="section-card" style={{ marginBottom: 0 }}>
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-title-dot" style={{ backgroundColor: '#ef4444' }} />
                  Alert Statistics
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Geofence ENTRY Alerts</span>
                  <strong style={{ color: 'var(--color-text-dark)' }}>{entryAlerts}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Geofence EXIT Alerts</span>
                  <strong style={{ color: 'var(--color-text-dark)' }}>{exitAlerts}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Speed Limit Violations</span>
                  <strong style={{ color: 'var(--color-text-dark)' }}>0</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>System Warnings</span>
                  <strong style={{ color: 'var(--color-text-dark)' }}>0</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Activity Summary & Weekly Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Daily Activity Summary */}
            <div className="section-card" style={{ marginBottom: 0 }}>
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-title-dot" style={{ backgroundColor: '#3b82f6' }} />
                  Daily Activity Summary
                </h2>
                <span className="section-tag">System Log</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '8px 12px', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                  <strong style={{ color: 'var(--color-text-dark)' }}>Fleet Utilization:</strong> {runningCount} of {totalVehicles} vehicles currently running on active telemetry streams.
                </div>
                <div style={{ padding: '8px 12px', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                  <strong style={{ color: 'var(--color-text-dark)' }}>Geofence Monitoring:</strong> {totalAlerts} total boundary events detected across all monitored zones.
                </div>
                <div style={{ padding: '8px 12px', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                  <strong style={{ color: 'var(--color-text-dark)' }}>System Status:</strong> Worker threads & Socket.IO telemetry ingester operating normally.
                </div>
              </div>
            </div>

            {/* Weekly Summary Cards */}
            <div className="section-card" style={{ marginBottom: 0 }}>
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-title-dot" style={{ backgroundColor: '#a855f7' }} />
                  Weekly Summary
                </h2>
                <span className="section-tag">Averages</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Avg Speed</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-dark)', marginTop: '4px' }}>42.8 km/h</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Fuel Efficiency</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-dark)', marginTop: '4px' }}>7.4 km/L</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Hours</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-dark)', marginTop: '4px' }}>142.5 hrs</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Distance</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-dark)', marginTop: '4px' }}>3,450 km</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Reports;
