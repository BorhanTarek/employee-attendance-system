import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'users'

  // Employee Form State
  const [usersList, setUsersList] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });
  const [createLoading, setCreateLoading] = useState(false);

  // Attendance Logs State
  const [logs, setLogs] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [logsLoading, setLogsLoading] = useState(false);

  // Load staff list & logs
  useEffect(() => {
    loadUsers();
    loadAttendanceLogs();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsersList(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadAttendanceLogs = async () => {
    setLogsLoading(true);
    try {
      const filters = {};
      if (filterDate) filters.date = filterDate;
      if (filterUser) filters.userId = filterUser;

      const data = await api.getAttendanceLogs(filters);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load attendance logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormMsg({ type: '', text: '' });
    setCreateLoading(true);

    try {
      await api.createUser({ name, email, employeeId, password, role });
      setFormMsg({ type: 'success', text: `Employee '${name}' created successfully!` });
      setName('');
      setEmail('');
      setEmployeeId('');
      setPassword('');
      loadUsers();
    } catch (err) {
      setFormMsg({ type: 'danger', text: err.message || 'Failed to create user' });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteUser = async (id, userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName}?`)) return;
    try {
      await api.deleteUser(id);
      loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to delete employee');
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '30px 20px' }}>
      {/* RATP Dev Top Navbar */}
      <header className="glass-panel" style={{ padding: '18px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #009aa6 0%, #00c897 100%)',
            color: '#04141c',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.95rem'
          }}>
            RATP
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: '#fff' }}>GeoAttend <span style={{ fontSize: '0.8rem', color: '#00c897', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>RATP Dev Operations</span></h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Logged in as <b>{user?.name}</b> ({user?.email})
            </p>
          </div>
        </div>
        <button onClick={logout} className="btn-danger">Sign Out</button>
      </header>

      {/* Navigation Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          📊 Daily Attendance Logs
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Employee Management
        </button>
      </div>

      {/* TAB 1: Attendance Logs */}
      {activeTab === 'attendance' && (
        <div>
          {/* Filters Bar */}
          <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter by Date</label>
              <input
                type="date"
                className="glass-input"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter by Employee</label>
              <select
                className="glass-input"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
              >
                <option value="">All Staff Members</option>
                {usersList.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ alignSelf: 'flex-end' }}>
              <button className="btn-primary" onClick={loadAttendanceLogs}>
                Apply Filters
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', color: '#fff' }}>Punch Records</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>Total Logs: {logs.length}</span>
            </div>

            {logsLoading ? (
              <p style={{ color: 'var(--text-muted)', padding: '20px' }}>Loading logs...</p>
            ) : logs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '20px' }}>No attendance records found matching filters.</p>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Timestamp</th>
                      <th>Distance</th>
                      <th>Geofence Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log._id}>
                        <td>
                          <b>{log.user ? log.user.name : 'Unknown User'}</b>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{log.user?.email}</div>
                        </td>
                        <td>{log.user?.employeeId || '-'}</td>
                        <td>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            background: log.type === 'check-in' ? 'rgba(0, 154, 166, 0.25)' : 'rgba(0, 200, 151, 0.25)',
                            color: log.type === 'check-in' ? '#38d9e6' : '#00c897',
                            border: log.type === 'check-in' ? '1px solid rgba(0, 154, 166, 0.4)' : '1px solid rgba(0, 200, 151, 0.4)'
                          }}>
                            {log.type.toUpperCase()}
                          </span>
                        </td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td>{log.distanceFromTarget} meters</td>
                        <td>
                          <span className={`badge ${log.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                            {log.status === 'success' ? '✓ In Bounds' : '✕ Out of Bounds'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Employee Management */}
      {activeTab === 'users' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {/* Create User Form */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>Create New Employee Account</h2>

            {formMsg.text && (
              <div className={`alert alert-${formMsg.type}`}>
                <span>{formMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full Name</label>
                <input
                  type="text"
                  className="glass-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email Address</label>
                <input
                  type="email"
                  className="glass-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean.dupont@ratpdev.com"
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Employee ID</label>
                <input
                  type="text"
                  className="glass-input"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="EMP102"
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Password</label>
                <input
                  type="password"
                  className="glass-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set initial password"
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>System Role</label>
                <select
                  className="glass-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={createLoading}>
                {createLoading ? 'Creating Account...' : '+ Create Employee Account'}
              </button>
            </form>
          </div>

          {/* Active Staff List Table */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>Active Staff Roster ({usersList.length})</h2>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <b>{u.name}</b>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{u.email}</div>
                      </td>
                      <td>{u.employeeId}</td>
                      <td>
                        <span className="badge badge-role">{u.role}</span>
                      </td>
                      <td>
                        {u.role !== 'Admin' && (
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="btn-danger"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
