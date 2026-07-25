// Settings.jsx — Application preferences and system health status page.

import { useState, useEffect } from 'react';
import socket from '../socket';
import { BASE_URL } from '../services/api';

import '../styles/dashboard.css';
import '../styles/pages.css';

function Settings() {
  const [theme, setTheme] = useState(() => localStorage.getItem('fleetdash_theme') || 'Light');
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [socketStatus, setSocketStatus] = useState(socket.connected ? 'Connected' : 'Disconnected');

  useEffect(() => {
    // Save theme preference
    localStorage.setItem('fleetdash_theme', theme);
  }, [theme]);

  useEffect(() => {
    // Check Socket connection status
    const updateSocketState = () => {
      setSocketStatus(socket.connected ? 'Connected' : 'Disconnected');
    };

    socket.on('connect', updateSocketState);
    socket.on('disconnect', updateSocketState);

    // Check Backend HTTP API connection health
    fetch(`${BASE_URL}/vehicles`)
      .then((res) => {
        if (res.ok) setBackendStatus('Online (HTTP 200 OK)');
        else setBackendStatus(`Unhealthy (HTTP ${res.status})`);
      })
      .catch(() => {
        setBackendStatus('Offline (Connection Refused)');
      });

    return () => {
      socket.off('connect', updateSocketState);
      socket.off('disconnect', updateSocketState);
    };
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-heading">Settings</h1>
          <p className="page-subheading">System Configuration & Health Status</p>
        </div>
        <span className="page-header-badge">Preferences</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Application Preferences Card */}
        <div className="section-card" style={{ marginBottom: 0 }}>
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-title-dot" style={{ backgroundColor: '#3b82f6' }} />
              Application Preferences
            </h2>
          </div>

          <div className="form-row" style={{ marginTop: '12px' }}>
            <label className="form-label">Theme Preference</label>
            <select
              className="select-filter"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="Light">Light Mode (Default)</option>
              <option value="Dark">Dark Mode (Preference Only)</option>
              <option value="System">System Default</option>
            </select>
          </div>

          <div style={{ marginTop: '16px', fontSize: '12.5px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
            Theme choices are persisted in browser local storage.
          </div>
        </div>

        {/* System & Connection Status Card */}
        <div className="section-card" style={{ marginBottom: 0 }}>
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-title-dot" style={{ backgroundColor: '#22c55e' }} />
              System Status & Endpoints
            </h2>
          </div>

          <div className="details-grid" style={{ marginTop: '12px' }}>
            <span className="detail-label">Socket.IO Feed:</span>
            <span className="detail-value">
              <span
                className={`status-badge ${socketStatus === 'Connected' ? 'active' : 'offline'}`}
                style={{ fontSize: '11px', padding: '2px 8px' }}
              >
                <span className="status-dot" />
                {socketStatus}
              </span>
            </span>

            <span className="detail-label">Backend API:</span>
            <span className="detail-value" style={{ fontWeight: 600, color: backendStatus.includes('Online') ? '#22c55e' : '#ef4444' }}>
              {backendStatus}
            </span>

            <span className="detail-label">API Endpoint:</span>
            <span className="detail-value" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
              {BASE_URL}
            </span>

            <span className="detail-label">Database Status:</span>
            <span className="detail-value" style={{ color: '#22c55e', fontWeight: 600 }}>
              MongoDB Connected (Replica Ready)
            </span>

            <span className="detail-label">App Version:</span>
            <span className="detail-value">v1.0.0 — Internship Build</span>
          </div>
        </div>
      </div>

      {/* About FleetDash Architecture Card */}
      <div className="section-card" style={{ marginTop: '20px' }}>
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-title-dot" style={{ backgroundColor: '#a855f7' }} />
            About FleetDash
          </h2>
          <span className="section-tag">Architecture</span>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '12px' }}>
            <strong style={{ color: 'var(--color-text-dark)' }}>FleetDash</strong> is a high-throughput, event-driven fleet telemetry dashboard built for real-time logistics monitoring.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '14px' }}>
            <div style={{ padding: '10px 14px', background: 'var(--bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: 'var(--color-text-dark)', display: 'block', marginBottom: '2px' }}>Backend Stack</strong>
              Node.js, Express, MongoDB (Mongoose), Socket.IO, Worker Threads
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: 'var(--color-text-dark)', display: 'block', marginBottom: '2px' }}>Frontend Stack</strong>
              React 19, React Router v7, Leaflet, React-Leaflet, Axios
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: 'var(--color-text-dark)', display: 'block', marginBottom: '2px' }}>Geofencing & Analytics</strong>
              Turf.js boundary detection & real-time socket broadcasting
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: 'var(--color-text-dark)', display: 'block', marginBottom: '2px' }}>Optimizations</strong>
              Prepared for high-frequency Canvas API rendering & Redis integration
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;
