import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎭</span>
          <span className="logo-text">Event<strong>Book</strong></span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/events" className={`nav-link ${location.pathname === '/events' ? 'active' : ''}`}>Browse Events</Link>
          {user && <Link to="/my-bookings" className={`nav-link ${location.pathname === '/my-bookings' ? 'active' : ''}`}>My Bookings</Link>}
          {isAdmin && <Link to="/admin" className={`nav-link nav-link-admin ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>⚙️ Admin</Link>}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <button className="user-avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
                <span className="user-name">{user.name.split(' ')[0]}</span>
                <span className="chevron">▾</span>
              </button>
              {dropdownOpen && (
                <div className="dropdown">
                  <div className="dropdown-header">
                    <div className="avatar lg">{user.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="dropdown-name">{user.name}</div>
                      <div className="dropdown-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item">👤 Profile</Link>
                  <Link to="/my-bookings" className="dropdown-item">🎟️ My Bookings</Link>
                  {isAdmin && <Link to="/admin" className="dropdown-item">⚙️ Admin Dashboard</Link>}
                  <div className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item dropdown-logout">🚪 Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
