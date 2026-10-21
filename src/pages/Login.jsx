import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Calendar, LogIn, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [isLoginTab, setIsLoginTab] = useState(true);
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regGender, setRegGender] = useState('MALE');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await login(loginEmail, loginPassword);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const regData = {
        name: regName,
        email: regEmail,
        password: regPassword,
        age: regAge ? parseInt(regAge, 10) : null,
        gender: regGender
      };

      await register(regData);
      setSuccess('Registration successful! Logging you in...');
      
      setTimeout(async () => {
        try {
          await login(regEmail, regPassword);
          navigate('/');
        } catch (lErr) {
          setIsLoginTab(true);
        }
      }, 1200);

    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <Lock size={28} color="#06b6d4" />
          </div>
          <h2>Welcome to Spring Security</h2>
          <p>JWT HttpOnly Cookie Authentication</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLoginTab ? 'active' : ''}`}
            onClick={() => { setIsLoginTab(true); setError(''); setSuccess(''); }}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
          <button
            className={`auth-tab ${!isLoginTab ? 'active' : ''}`}
            onClick={() => { setIsLoginTab(false); setError(''); setSuccess(''); }}
          >
            <UserPlus size={16} />
            <span>Register</span>
          </button>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-alert success">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {isLoginTab ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In with Cookie'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password (min 6 chars)</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Age</label>
                <div className="input-wrapper">
                  <Calendar size={18} className="input-icon" />
                  <input
                    type="number"
                    placeholder="25"
                    min="18"
                    max="120"
                    value={regAge}
                    onChange={(e) => setRegAge(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group half">
                <label>Gender</label>
                <select
                  value={regGender}
                  onChange={(e) => setRegGender(e.target.value)}
                  className="select-input"
                >
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p className="cookie-note">
            ðŸ”’ Security Notice: Authentication tokens are stored in <strong>HttpOnly Cookies</strong>. No credentials stored in localStorage.
          </p>
        </div>
      </div>
    </div>
  );
}
