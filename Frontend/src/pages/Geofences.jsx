// Geofences.jsx — Geofence boundary management page with full CRUD.

import { useState, useEffect, useCallback } from 'react';
import { getGeofences, createGeofence, updateGeofence, deleteGeofence } from '../services/api';

import '../styles/dashboard.css';
import '../styles/vehicleTable.css';
import '../styles/pages.css';

function Modal({ title, onClose, children, size = '' }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-box ${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function GeofenceForm({ initial = {}, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [form, setForm] = useState({
    name:      initial.name                    ?? '',
    latitude:  initial.center?.latitude  ?? initial.latitude  ?? 18.5204,
    longitude: initial.center?.longitude ?? initial.longitude ?? 73.8567,
    radius:    initial.radius                  ?? 500,
  });
  const [err, setErr] = useState('');

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setErr('Geofence name is required.');
      return;
    }
    try {
      setErr('');
      await onSubmit({
        name: form.name.trim(),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        radius: parseFloat(form.radius),
      });
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {err && <div className="form-error">{err}</div>}

      <div className="form-row">
        <label className="form-label">Geofence Name</label>
        <input
          className="form-input"
          value={form.name}
          onChange={set('name')}
          placeholder="e.g. Pune Central Depot"
          required
        />
      </div>

      <div className="form-row">
        <label className="form-label">Center Latitude</label>
        <input
          type="number"
          step="any"
          className="form-input"
          value={form.latitude}
          onChange={set('latitude')}
          placeholder="e.g. 18.5204"
          required
        />
      </div>

      <div className="form-row">
        <label className="form-label">Center Longitude</label>
        <input
          type="number"
          step="any"
          className="form-input"
          value={form.longitude}
          onChange={set('longitude')}
          placeholder="e.g. 73.8567"
          required
        />
      </div>

      <div className="form-row">
        <label className="form-label">Radius (meters)</label>
        <input
          type="number"
          step="any"
          className="form-input"
          value={form.radius}
          onChange={set('radius')}
          placeholder="e.g. 500"
          required
        />
      </div>

      <div className="modal-foot">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}

function Geofences() {
  const [geofences, setGeofences] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [search,    setSearch]    = useState('');

  // Modal: null | 'create' | 'edit' | 'delete'
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGeofences();
      setGeofences(data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch geofences list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = geofences.filter((g) =>
    (g.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (type, gf = null) => { setSelected(gf); setModal(type); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleCreate = async (data) => {
    await createGeofence(data);
    await load();
    closeModal();
  };

  const handleEdit = async (data) => {
    await updateGeofence(selected._id, data);
    await load();
    closeModal();
  };

  const handleDelete = async () => {
    try {
      await deleteGeofence(selected._id);
      await load();
      closeModal();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-heading">Geofences</h1>
          <p className="page-subheading">Virtual Boundary Zones & Monitoring Perimeters</p>
        </div>
        <button className="btn-primary" onClick={() => openModal('create')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Geofence
        </button>
      </div>

      <div className="section-card">
        <div className="actions-bar">
          <div className="filter-group">
            <input
              type="text"
              className="input-search"
              placeholder="Search geofences by zone name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="section-tag">{filtered.length} Geofence Zones</span>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="table-empty">Loading geofence boundaries...</div>
          ) : error ? (
            <div className="table-empty" style={{ color: '#ef4444' }}>{error}</div>
          ) : filtered.length === 0 ? (
            <div className="table-empty">No geofences configured. Click "Create Geofence" to add one.</div>
          ) : (
            <table className="vehicle-table">
              <thead>
                <tr>
                  <th>Geofence Name</th>
                  <th>Center Latitude</th>
                  <th>Center Longitude</th>
                  <th>Radius (meters)</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => {
                  const lat = g.center?.latitude ?? g.latitude ?? '—';
                  const lng = g.center?.longitude ?? g.longitude ?? '—';

                  return (
                    <tr key={g._id || g.name}>
                      <td style={{ fontWeight: 600 }}>{g.name}</td>
                      <td className="coordinate-value">{typeof lat === 'number' ? lat.toFixed(4) : lat}</td>
                      <td className="coordinate-value">{typeof lng === 'number' ? lng.toFixed(4) : lng}</td>
                      <td className="metric-value">{g.radius} m</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>
                        {g.createdAt ? new Date(g.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="action-btn edit" onClick={() => openModal('edit', g)}>Edit</button>
                          <button className="action-btn delete" onClick={() => openModal('delete', g)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── MODALS ── */}

      {modal === 'create' && (
        <Modal title="Create New Geofence" onClose={closeModal}>
          <GeofenceForm onSubmit={handleCreate} onCancel={closeModal} submitLabel="Save Geofence" />
        </Modal>
      )}

      {modal === 'edit' && selected && (
        <Modal title={`Edit Geofence: ${selected.name}`} onClose={closeModal}>
          <GeofenceForm initial={selected} onSubmit={handleEdit} onCancel={closeModal} submitLabel="Update Geofence" />
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal title="Confirm Geofence Deletion" onClose={closeModal} size="modal-sm">
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-dark)', marginBottom: '6px' }}>
            Delete geofence boundary <strong>{selected.name}</strong>?
          </p>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
            Vehicles entering or exiting this perimeter will no longer trigger alert notifications.
          </p>
          <div className="modal-foot">
            <button className="btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn-danger" onClick={handleDelete}>Yes, Delete</button>
          </div>
        </Modal>
      )}
    </>
  );
}

export default Geofences;
