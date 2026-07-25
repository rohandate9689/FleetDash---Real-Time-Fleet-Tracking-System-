// api.js — All HTTP requests to the FleetDash backend REST API.

const BASE_URL = 'http://localhost:5001/api';

// ── Vehicles ──────────────────────────────────────────────────────────

async function getVehicles() {
  const res = await fetch(`${BASE_URL}/vehicles`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.success && Array.isArray(json.data)) return json.data;
  throw new Error('Invalid response format from server');
}

async function createVehicle(data) {
  const res = await fetch(`${BASE_URL}/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  if (json.success) return json.data;
  throw new Error('Failed to create vehicle');
}

async function updateVehicle(id, data) {
  const res = await fetch(`${BASE_URL}/vehicles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  if (json.success) return json.data;
  throw new Error('Failed to update vehicle');
}

async function deleteVehicle(id) {
  const res = await fetch(`${BASE_URL}/vehicles/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  if (json.success) return true;
  throw new Error('Failed to delete vehicle');
}

// ── Alerts ────────────────────────────────────────────────────────────

async function getAlerts() {
  const res = await fetch(`${BASE_URL}/alerts`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.success) return json.data;
  throw new Error('Invalid response format');
}

// ── Geofences ─────────────────────────────────────────────────────────

async function getGeofences() {
  const res = await fetch(`${BASE_URL}/geofences`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.success && Array.isArray(json.data)) return json.data;
  throw new Error('Invalid response format from server');
}

async function createGeofence(data) {
  const res = await fetch(`${BASE_URL}/geofences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  if (json.success) return json.data;
  throw new Error('Failed to create geofence');
}

async function updateGeofence(id, data) {
  const res = await fetch(`${BASE_URL}/geofences/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  if (json.success) return json.data;
  throw new Error('Failed to update geofence');
}

async function deleteGeofence(id) {
  const res = await fetch(`${BASE_URL}/geofences/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  if (json.success) return true;
  throw new Error('Failed to delete geofence');
}

export {
  BASE_URL,
  getVehicles, createVehicle, updateVehicle, deleteVehicle,
  getAlerts,
  getGeofences, createGeofence, updateGeofence, deleteGeofence,
};
