import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, UserPlus, ShoppingBag, Database, LogOut, LogIn, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/" className="brand-logo">
          <div className="logo-icon">
            <Database size={22} color="#06b6d4" />
          </div>
          <span className="brand-title">Spring<span className="brand-highlight">React</span></span>
          <span className="badge-tag">PostgreSQL</span>
        </NavLink>

        <div className="nav-links">
          {user ? (
            <>
              <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <Users size={18} />
                <span>Users List</span>
              </NavLink>

              <NavLink to="/add-user" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <UserPlus size={18} />
                <span>Add User</span>
              </NavLink>

              <NavLink to="/products" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <ShoppingBag size={18} />
                <span>Products</span>
              </NavLink>

              <div className="user-profile-badge">
                <UserIcon size={16} color="#06b6d4" />
                <span className="user-name">{user.name}</span>
              </div>

              <button className="logout-btn" onClick={handleLogout} title="Sign Out">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <NavLink to="/login" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
              <LogIn size={18} />
              <span>Sign In / Register</span>
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
