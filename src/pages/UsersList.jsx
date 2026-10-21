import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, deleteUser, updateUser } from '../api/api';
import { Users, UserPlus, Trash2, Edit, Search, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, Mail, Calendar, UserCheck, X } from 'lucide-react';
import './UsersList.css';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', age: '' });
  const [updating, setUpdating] = useState(false);

  const fetchUsersList = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Unable to connect to Spring Boot backend at http://localhost:8080. Is your server running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}" (ID: ${id})?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
      showToast(`User "${name}" deleted successfully!`);
    } catch (err) {
      alert("Failed to delete user. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      age: user.age || ''
    });
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setUpdating(true);
      const payload = {
        name: editFormData.name,
        age: editFormData.age ? parseInt(editFormData.age, 10) : null
      };

      const res = await updateUser(editingUser.id, payload);
      const updatedUser = res.data;

      setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
      setEditingUser(null);
      showToast(`User "${updatedUser.name}" updated successfully!`);
    } catch (err) {
      alert("Failed to update user. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredUsers = users.filter(user =>
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeUsersCount = users.filter(u => u.isActive).length;

  return (
    <div className="users-page animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle2 size={18} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Edit User Modal Overlay */}
      {editingUser && (
        <div className="modal-overlay animate-fade-in">
          <div className="glass-card modal-container">
            <div className="modal-header">
              <h3>Edit User (#{editingUser.id})</h3>
              <button onClick={() => setEditingUser(null)} className="close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="modal-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 30"
                  value={editFormData.age}
                  onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="btn btn-primary">
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Connected to PostgreSQL via Spring Boot REST API (`/api/users`)</p>
        </div>

        <div className="header-actions">
          <button onClick={fetchUsersList} className="btn btn-secondary" title="Refresh Users">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/add-user" className="btn btn-primary">
            <UserPlus size={18} />
            <span>Add New User</span>
          </Link>
        </div>
      </div>

      {/* Analytics Dashboard Cards */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-icon cyan">
            <Users size={22} />
          </div>
          <div>
            <div className="metric-value">{users.length}</div>
            <div className="metric-label">Total Users</div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon emerald">
            <UserCheck size={22} />
          </div>
          <div>
            <div className="metric-value">{activeUsersCount}</div>
            <div className="metric-label">Active Users</div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon purple">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="metric-value">PostgreSQL</div>
            <div className="metric-label">Schema: `details.users`</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="filter-bar glass-card">
        <div className="search-input-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="result-count">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="state-container glass-card">
          <RefreshCw size={36} className="spin accent-icon" />
          <p>Fetching users from Spring Boot backend...</p>
        </div>
      ) : error ? (
        <div className="state-container error-card glass-card">
          <AlertCircle size={40} color="#f43f5e" />
          <h3>Connection Failed</h3>
          <p>{error}</p>
          <button onClick={fetchUsersList} className="btn btn-primary">
            Retry Connection
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="state-container glass-card">
          <Users size={40} className="text-dim" />
          <h3>No Users Found</h3>
          <p>{searchTerm ? `No users match "${searchTerm}"` : 'Your PostgreSQL table is currently empty.'}</p>
          <Link to="/add-user" className="btn btn-primary">
            Create First User
          </Link>
        </div>
      ) : (
        <div className="users-grid">
          {filteredUsers.map((user) => (
            <div key={user.id} className="user-card glass-card">
              <div className="user-header">
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-info">
                  <h3 className="user-name">{user.name}</h3>
                  <div className="user-email">
                    <Mail size={13} />
                    <span>{user.email}</span>
                  </div>
                </div>
                <div className="user-badges">
                  <span className={`badge ${user.isActive ? 'badge-active' : 'badge-inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="user-details">
                <div className="detail-item">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value font-mono">#{user.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Age:</span>
                  <span className="detail-value">{user.age ? `${user.age} yrs` : 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Gender:</span>
                  <span className="badge badge-gender">{user.gender || 'NOT SPECIFIED'}</span>
                </div>
                {user.createdAt && (
                  <div className="detail-item">
                    <Calendar size={13} className="text-dim" />
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="user-actions" style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleOpenEditModal(user)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(user.id, user.name)}
                  disabled={deletingId === user.id}
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                >
                  <Trash2 size={16} />
                  <span>{deletingId === user.id ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
