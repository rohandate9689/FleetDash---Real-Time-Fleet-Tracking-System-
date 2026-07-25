// LiveTracking.jsx — Full-screen vehicle tracking page with live map & telemetry.

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import socket from '../socket';
import { getVehicles } from '../services/api';

import '../styles/dashboard.css';
import '../styles/tracking.css';
import '../styles/pages.css';

// Fix for default Leaflet marker assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper component to smoothly update Leaflet map center when selected vehicle changes
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] != null && center[1] != null) {
      map.setView(center, 14, { animate: true });
    }
  }, [center, map]);
  return null;
}

function LiveTracking() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const defaultCenter = [18.5204, 73.8567]; // Pune default center
  const mapRef = useRef(null);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await getVehicles();
      setVehicles(data);
      if (data.length > 0) {
        // Select first vehicle with valid coordinates by default
        const firstValid = data.find(
          (v) => v.currentLocation?.latitude != null && v.currentLocation?.longitude != null
        );
        setSelectedId((firstValid || data[0]).vehicleId);
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch fleet location telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();

    socket.connect();

    socket.on('connect', () => {
      console.log('🟢 Socket Connected (Tracking):', socket.id);
    });

    socket.on('telemetry-update', (telemetry) => {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.vehicleId !== telemetry.vehicleId) return v;
          return {
            ...v,
            currentLocation: {
              latitude: telemetry.latitude,
              longitude: telemetry.longitude,
            },
            speed: telemetry.speed,
            fuel: telemetry.fuel,
            updatedAt: telemetry.timestamp,
          };
        })
      );
    });

    return () => {
      socket.off('telemetry-update');
      socket.disconnect();
    };
  }, []);

  const filteredVehicles = vehicles.filter((v) => {
    const q = search.toLowerCase();
    return (
      (v.vehicleId || '').toLowerCase().includes(q) ||
      (v.vehicleNumber || '').toLowerCase().includes(q) ||
      (v.driverName || '').toLowerCase().includes(q)
    );
  });

  const selectedVehicle = vehicles.find((v) => v.vehicleId === selectedId);

  const mapCenter =
    selectedVehicle?.currentLocation?.latitude != null &&
    selectedVehicle?.currentLocation?.longitude != null
      ? [selectedVehicle.currentLocation.latitude, selectedVehicle.currentLocation.longitude]
      : defaultCenter;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-heading">Live Tracking</h1>
          <p className="page-subheading">Real-time Map Positioning & Telemetry Stream</p>
        </div>
        <span className="page-header-badge">
          {socket.connected ? '🟢 Live Socket Feed' : '⚪ Socket Reconnecting...'}
        </span>
      </div>

      <div className="tracking-layout">
        {/* Left Side: Vehicle List Panel */}
        <div className="tracking-panel">
          <div className="tracking-panel-head">
            <div className="tracking-panel-title">Fleet Vehicles ({filteredVehicles.length})</div>
            <input
              type="text"
              className="input-search tracking-search"
              placeholder="Search ID, plate, driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="tracking-list">
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                Loading live locations...
              </div>
            ) : error ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444', fontSize: '13px' }}>
                {error}
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                No matching vehicles found.
              </div>
            ) : (
              filteredVehicles.map((v) => {
                const isActive = v.vehicleId === selectedId;
                const status = (v.status || 'idle').toLowerCase();

                return (
                  <div
                    key={v.vehicleId}
                    className={`tracking-item ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedId(v.vehicleId)}
                  >
                    <div className={`tracking-item-dot ${status}`} />
                    <div className="tracking-item-info">
                      <div className="tracking-item-id">{v.vehicleId} ({v.vehicleNumber})</div>
                      <div className="tracking-item-driver">Driver: {v.driverName || 'Unassigned'}</div>
                    </div>
                    <div className="tracking-item-speed">
                      {v.speed != null ? `${v.speed} km/h` : '0 km/h'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Leaflet Map Container */}
        <div className="tracking-map-wrap">
          <MapContainer
            center={defaultCenter}
            zoom={12}
            whenCreated={(map) => (mapRef.current = map)}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView center={mapCenter} />

            {vehicles.map((v) => {
              const lat = v.currentLocation?.latitude;
              const lng = v.currentLocation?.longitude;
              if (lat == null || lng == null) return null;

              return (
                <Marker
                  key={v.vehicleId}
                  position={[lat, lng]}
                  eventHandlers={{
                    click: () => setSelectedId(v.vehicleId),
                  }}
                >
                  <Popup>
                    <div style={{ fontSize: '12.5px', lineHeight: '1.5' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--color-text-dark)' }}>
                        {v.vehicleId} ({v.vehicleNumber})
                      </strong>
                      <br />
                      <strong>Driver:</strong> {v.driverName}<br />
                      <strong>Status:</strong> {v.status}<br />
                      <strong>Speed:</strong> {v.speed ?? 0} km/h<br />
                      <strong>Fuel:</strong> {v.fuel ?? 0}%
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Floating Live Telemetry Info Overlay Card */}
          {selectedVehicle && (
            <div className="telemetry-card">
              <div className="tc-header">
                <span className="tc-vehicle-id">{selectedVehicle.vehicleId}</span>
                <span
                  className={`status-badge ${(selectedVehicle.status || '').toLowerCase() === 'running' ? 'active' : (selectedVehicle.status || '').toLowerCase()}`}
                  style={{ transform: 'scale(0.85)' }}
                >
                  <span className="status-dot" />
                  {selectedVehicle.status}
                </span>
              </div>

              <div className="tc-row">
                <span className="tc-label">Plate Number:</span>
                <span className="tc-value">{selectedVehicle.vehicleNumber}</span>
              </div>
              <div className="tc-row">
                <span className="tc-label">Driver:</span>
                <span className="tc-value">{selectedVehicle.driverName}</span>
              </div>
              <div className="tc-row">
                <span className="tc-label">Speed:</span>
                <span className="tc-value" style={{ color: 'var(--color-primary)' }}>
                  {selectedVehicle.speed ?? 0} km/h
                </span>
              </div>
              <div className="tc-row">
                <span className="tc-label">Fuel Level:</span>
                <span
                  className="tc-value"
                  style={{ color: (selectedVehicle.fuel ?? 100) < 20 ? '#ef4444' : '#22c55e' }}
                >
                  {selectedVehicle.fuel ?? 0}%
                </span>
              </div>
              <div className="tc-coords">
                LAT: {selectedVehicle.currentLocation?.latitude?.toFixed(4) ?? '—'}<br />
                LNG: {selectedVehicle.currentLocation?.longitude?.toFixed(4) ?? '—'}
              </div>
              <div className="tc-row" style={{ marginTop: '8px', marginBottom: 0 }}>
                <span className="tc-label" style={{ fontSize: '11px' }}>Last Update:</span>
                <span className="tc-value" style={{ fontSize: '11px', fontWeight: 'normal' }}>
                  {selectedVehicle.updatedAt
                    ? new Date(selectedVehicle.updatedAt).toLocaleTimeString()
                    : '—'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default LiveTracking;
