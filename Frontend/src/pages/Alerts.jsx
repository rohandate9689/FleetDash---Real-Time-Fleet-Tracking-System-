// Alerts.jsx — Alert management & real-time notification log page.

import { useState, useEffect } from 'react';
import { getAlerts } from '../services/api';
import socket from '../socket';

import '../styles/dashboard.css';
import '../styles/alertPanel.css';
import '../styles/pages.css';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlerts();
      setAlerts(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch alert logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();

    socket.connect();

    socket.on('connect', () => {
      console.log('🟢 Socket Connected (Alerts):', socket.id);
    });

    socket.on('new-alert', (newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
    });

    return () => {
      socket.off('new-alert');
      socket.disconnect();
    };
  }, []);

  const filteredAlerts = alerts.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (a.vehicleId || '').toLowerCase().includes(q) ||
      (a.geofenceName || '').toLowerCase().includes(q) ||
      (a.message || '').toLowerCase().includes(q);

    const matchType =
      typeFilter === 'All' ||
      (a.type || '').toUpperCase() === typeFilter.toUpperCase();

    let matchDate = true;
    if (dateFilter && a.createdAt) {
      const d = new Date(a.createdAt).toISOString().slice(0, 10);
      matchDate = d === dateFilter;
    }

    return matchSearch && matchType && matchDate;
  });

  const latestAlert = alerts[0];
  const entryCount = alerts.filter((a) => (a.type || '').toUpperCase() === 'ENTRY').length;
  const exitCount = alerts.filter((a) => (a.type || '').toUpperCase() === 'EXIT').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-heading">Alerts</h1>
          <p className="page-subheading">Geofence Boundary & Security Notifications</p>
        </div>
        <span className="page-header-badge">
          {socket.connected ? '🟢 Live Socket Listener' : '⚪ Socket Reconnecting...'}
        </span>
      </div>

      {/* Latest Alert Badge Banner */}
      {latestAlert && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            borderRadius: 'var(--radius-card)',
            padding: '12px 18px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, fontSize: '13px', color: '#991b1b' }}>
            <strong>LATEST ALERT:</strong> {latestAlert.message} (
            {new Date(latestAlert.createdAt).toLocaleTimeString()})
          </div>
          <span
            className={`severity-badge ${(latestAlert.type || '').toUpperCase()}`}
            style={{ fontSize: '10px', padding: '2px 8px' }}
          >
            {latestAlert.type}
          </span>
        </div>
      )}

      {/* Stats row */}
      <div className="stats-grid" style={{ marginBottom: '18px' }}>
        <div className="stat-card blue">
          <div className="stat-label">Total Logged Alerts</div>
          <div className="stat-value">{alerts.length}</div>
          <div className="stat-sub">{filteredAlerts.length} matching current filter</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Geofence Entries</div>
          <div className="stat-value">{entryCount}</div>
          <div className="stat-sub">Boundary entry events</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Geofence Exits</div>
          <div className="stat-value">{exitCount}</div>
          <div className="stat-sub">Boundary exit events</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Active Socket Alerts</div>
          <div className="stat-value">{alerts.length > 0 ? 1 : 0}</div>
          <div className="stat-sub">Real-time alert status</div>
        </div>
      </div>

      {/* Section Card */}
      <div className="section-card">
        <div className="actions-bar">
          <div className="filter-group">
            <input
              type="text"
              className="input-search"
              placeholder="Search vehicle ID, geofence, message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="select-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Event Types</option>
              <option value="ENTRY">ENTRY</option>
              <option value="EXIT">EXIT</option>
              <option value="OVERSPEED">OVERSPEED</option>
              <option value="LOW_FUEL">LOW_FUEL</option>
            </select>
            <input
              type="date"
              className="input-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              title="Filter by Date"
            />
            {dateFilter && (
              <button
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setDateFilter('')}
              >
                Clear Date
              </button>
            )}
          </div>
          <span className="section-tag">{filteredAlerts.length} Alerts Logged</span>
        </div>

        {/* Alert List */}
        <div
          className="alert-list"
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div className="alert-empty">Loading alert history...</div>
          ) : error ? (
            <div className="alert-empty" style={{ color: '#ef4444' }}>
              {error}
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="alert-empty">No alerts match the selected criteria.</div>
          ) : (
            filteredAlerts.map((alert) => (
              <div className="alert-item"key={alert._id || `${alert.vehicleId}-${alert.createdAt}`}>
                <div className="alert-content-left">
                  <div className="alert-meta">
                    <span className="alert-vehicle">{alert.vehicleId}</span>
                    <span className="alert-meta-dot" />
                    <span className="alert-driver">{alert.geofenceName || 'Zone'}</span>
                    <span className="alert-meta-dot" />
                    <span className="alert-type">{alert.type}</span>
                  </div>
                  <p className="alert-message">{alert.message}</p>
                </div>
                <div className="alert-content-right">
                  <span
                    className={`severity-badge ${(alert.type || '').toUpperCase() === 'ENTRY' ? 'low' : 'high'}`}
                  >
                    {alert.type}
                  </span>
                  <span className="alert-time">
                    {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : '—'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Alerts;
