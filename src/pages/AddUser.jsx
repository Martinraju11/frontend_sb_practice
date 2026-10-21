import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUser } from '../api/api';
import { UserPlus, ArrowLeft, Mail, User, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import './AddUser.css';

export default function AddUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'MALE',
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError("Name and Email are required fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload = {
        name: formData.name,
        email: formData.email,
        age: formData.age ? parseInt(formData.age, 10) : null,
        gender: formData.gender,
        isActive: formData.isActive
      };

      await createUser(payload);
      navigate('/', { state: { message: `User "${formData.name}" created successfully!` } });
    } catch (err) {
      console.error("Failed to create user:", err);
      if (err.response && err.response.data) {
        setError(typeof err.response.data === 'string' ? err.response.data : 'Failed to save user. Duplicate email or invalid data.');
      } else {
        setError("Network Error: Is your Spring Boot backend running on http://localhost:8080?");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-page animate-fade-in">
      <Link to="/" className="back-link">
        <ArrowLeft size={18} />
        <span>Back to Users List</span>
      </Link>

      <div className="form-card glass-card">
        <div className="form-header">
          <div className="form-icon">
            <UserPlus size={24} color="#6366f1" />
          </div>
          <div>
            <h2>Add New User</h2>
            <p>Save a new user record directly into PostgreSQL `details.users`</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Martin Raju"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                required
                placeholder="e.g. martinraju53@gmail.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age</label>
              <div className="input-wrapper">
                <Calendar size={18} className="input-icon" />
                <input
                  type="number"
                  name="age"
                  placeholder="e.g. 29"
                  value={formData.age}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-input select-input"
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          <div className="form-group toggle-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="toggle-checkbox"
              />
              <span className="toggle-custom"></span>
              <span>Set as Active User</span>
            </label>
          </div>

          <div className="form-actions">
            <Link to="/" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <CheckCircle size={18} />
              <span>{loading ? 'Saving User...' : 'Save User to PostgreSQL'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
