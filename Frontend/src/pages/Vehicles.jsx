// Vehicles.jsx — Fleet vehicle management page with full CRUD.

import { useState, useEffect, useCallback } from 'react';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../services/api';

import '../styles/dashboard.css';
import '../styles/vehicleTable.css';
import '../styles/pages.css';

const STATUSES = ['All', 'Running', 'Idle', 'Offline'];
const PER_PAGE = 8;

function statusClass(s) {
  const v = (s || '').toLowerCase();
  if (v === 'running') return 'active';
  return v;
}

// ── Reusable modal ────────────────────────────────────────────────────
function Modal({ title, onClose, children, size = '' }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-box ${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Vehicle form (shared by Add and Edit) ─────────────────────────────
function VehicleForm({ initial = {}, readonlyId = false, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [form, setForm]   = useState({
    vehicleId:     initial.vehicleId     ?? '',
    vehicleNumber: initial.vehicleNumber ?? '',
    driverName:    initial.driverName    ?? '',
    status:        initial.status        ?? 'Idle',
  });
  const [err, setErr] = useState('');

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vehicleId || !form.vehicleNumber || !form.driverName) {
      setErr('All fields are required.');
      return;
    }
    try {
      setErr('');
      await onSubmit(form);
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {err && <div className="form-error">{err}</div>}

      <div className="form-row">
        <label className="form-label">Vehicle ID</label>
        <input
          className="form-input"
          value={form.vehicleId}
          onChange={set('vehicleId')}
          disabled={readonlyId}
          placeholder="e.g. V-101"
          required
        />
      </div>

      <div className="form-row">
        <label className="form-label">Plate / Number</label>
        <input
          className="form-input"
          value={form.vehicleNumber}
          onChange={set('vehicleNumber')}
          placeholder="e.g. MH-12-AB-1234"
          required
        />
      </div>

      <div className="form-row">
        <label className="form-label">Driver Name</label>
        <input
          className="form-input"
          value={form.driverName}
          onChange={set('driverName')}
          placeholder="e.g. Rajesh Kumar"
          required
        />
      </div>

      <div className="form-row">
        <label className="form-label">Status</label>
        <select className="form-select" value={form.status} onChange={set('status')}>
          <option>Idle</option>
          <option>Running</option>
          <option>Offline</option>
        </select>
      </div>

      <div className="modal-foot">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}

// ── Details grid ──────────────────────────────────────────────────────
function VehicleDetails({ v, onClose }) {
  const rows = [
    ['Vehicle ID',    v.vehicleId],
    ['Plate Number',  v.vehicleNumber],
    ['Driver',        v.driverName],
    ['Status',        v.status],
    ['Speed',         v.speed != null ? `${v.speed} km/h` : '—'],
    ['Fuel Level',    v.fuel  != null ? `${v.fuel}%`      : '—'],
    ['Latitude',      v.currentLocation?.latitude  ?? '—'],
    ['Longitude',     v.currentLocation?.longitude ?? '—'],
    ['Created At',    v.createdAt ? new Date(v.createdAt).toLocaleString() : '—'],
    ['Last Updated',  v.updatedAt ? new Date(v.updatedAt).toLocaleString() : '—'],
  ];

  return (
    <>
      <div className="details-grid">
        {rows.map(([label, val]) => (
          <>
            <span className="detail-label" key={`l-${label}`}>{label}</span>
            <span className="detail-value"  key={`v-${label}`}>
              {label === 'Status'
                ? <span className={`status-badge ${statusClass(v.status)}`}>
                    <span className="status-dot" />{v.status}
                  </span>
                : val}
            </span>
          </>
        ))}
      </div>
      <div className="modal-foot">
        <button className="btn-primary" onClick={onClose}>Close</button>
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────
function Vehicles() {
  const [vehicles,  setVehicles]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  // Filters
  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState('All');
  const [page,      setPage]      = useState(1);

  // Modal: null | 'add' | 'edit' | 'delete' | 'details'
  const [modal,     setModal]     = useState(null);
  const [selected,  setSelected]  = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setVehicles(await getVehicles());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Derived list
  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    const matchQ = !q || [v.vehicleId, v.vehicleNumber, v.driverName].some(
      (s) => (s || '').toLowerCase().includes(q)
    );
    const matchS = statusF === 'All' || (v.status || '').toLowerCase() === statusF.toLowerCase();
    return matchQ && matchS;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset page on filter change
  useEffect(() => setPage(1), [search, statusF]);

  const openModal = (type, vehicle = null) => { setSelected(vehicle); setModal(type); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleAdd = async (form) => {
    await createVehicle({ ...form, currentLocation: { latitude: 18.5204, longitude: 73.8567 } });
    await load();
    closeModal();
  };

  const handleEdit = async (form) => {
    await updateVehicle(selected._id, { driverName: form.driverName, vehicleNumber: form.vehicleNumber, status: form.status });
    await load();
    closeModal();
  };

  const handleDelete = async () => {
    try {
      await deleteVehicle(selected._id);
      await load();
      closeModal();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-heading">Vehicles</h1>
          <p className="page-subheading">Fleet Inventory Management</p>
        </div>
        <button className="btn-primary" onClick={() => openModal('add')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Vehicle
        </button>
      </div>

      {/* Table card */}
      <div className="section-card">

        {/* Actions bar */}
        <div className="actions-bar">
          <div className="filter-group">
            <input
              className="input-search"
              placeholder="Search by ID, plate, driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="select-filter" value={statusF} onChange={(e) => setStatusF(e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <span className="section-tag">{filtered.length} of {vehicles.length} vehicles</span>
        </div>

        {/* Table */}
        <div className="table-responsive">
          {loading ? (
            <div className="table-empty">Loading vehicle data...</div>
          ) : error ? (
            <div className="table-empty" style={{ color: '#ef4444' }}>{error}</div>
          ) : slice.length === 0 ? (
            <div className="table-empty">No vehicles found.</div>
          ) : (
            <table className="vehicle-table">
              <thead>
                <tr>
                  <th>Vehicle ID</th>
                  <th>Vehicle Number</th>
                  <th>Driver Name</th>
                  <th>Status</th>
                  <th>Speed</th>
                  <th>Fuel</th>
                  <th>Last Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((v) => (
                  <tr key={v._id || v.vehicleId}>
                    <td style={{ fontWeight: 600 }}>{v.vehicleId}</td>
                    <td>{v.vehicleNumber}</td>
                    <td>{v.driverName}</td>
                    <td>
                      <span className={`status-badge ${statusClass(v.status)}`}>
                        <span className="status-dot" />
                        {v.status}
                      </span>
                    </td>
                    <td className="metric-value">{v.speed != null ? `${v.speed} km/h` : '—'}</td>
                    <td className="metric-value">{v.fuel  != null ? `${v.fuel}%`      : '—'}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>
                      {v.updatedAt ? new Date(v.updatedAt).toLocaleTimeString() : '—'}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn view"   onClick={() => openModal('details', v)}>Details</button>
                        <button className="action-btn edit"   onClick={() => openModal('edit',    v)}>Edit</button>
                        <button className="action-btn delete" onClick={() => openModal('delete',  v)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="pagination-bar">
            <span>
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="pagination-pages">
              <button className="page-btn" disabled={page === 1}          onClick={() => setPage((p) => p - 1)}>Prev</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`page-btn${page === i + 1 ? ' active' : ''}`}
                  onClick={() => setPage(i + 1)}
                >{i + 1}</button>
              ))}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}

      {modal === 'add' && (
        <Modal title="Add New Vehicle" onClose={closeModal}>
          <VehicleForm onSubmit={handleAdd} onCancel={closeModal} submitLabel="Create Vehicle" />
        </Modal>
      )}

      {modal === 'edit' && selected && (
        <Modal title={`Edit Vehicle: ${selected.vehicleId}`} onClose={closeModal}>
          <VehicleForm
            initial={selected}
            readonlyId
            onSubmit={handleEdit}
            onCancel={closeModal}
            submitLabel="Update Vehicle"
          />
        </Modal>
      )}

      {modal === 'details' && selected && (
        <Modal title={`Vehicle: ${selected.vehicleId}`} onClose={closeModal} size="modal-lg">
          <VehicleDetails v={selected} onClose={closeModal} />
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal title="Confirm Deletion" onClose={closeModal} size="modal-sm">
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-dark)', marginBottom: '6px' }}>
            Delete vehicle <strong>{selected.vehicleId}</strong> ({selected.vehicleNumber})?
          </p>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
            Driver: {selected.driverName}. This action cannot be undone.
          </p>
          <div className="modal-foot">
            <button className="btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn-danger"    onClick={handleDelete}>Yes, Delete</button>
          </div>
        </Modal>
      )}
    </>
  );
}

export default Vehicles;
