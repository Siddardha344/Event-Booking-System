import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { adminAPI } from '../utils/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="text-muted">Manage events, bookings and users</p>
          </div>
          <Link to="/admin/events" className="btn btn-primary">+ Create Event</Link>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card card">
            <div className="card-body">
              <div className="stat-icon" style={{ background: 'rgba(52,152,219,0.15)', color: '#3498db' }}>🎪</div>
              <div className="stat-num">{stats?.totalEvents || 0}</div>
              <div className="stat-label">Total Events</div>
            </div>
          </div>
          <div className="stat-card card">
            <div className="card-body">
              <div className="stat-icon" style={{ background: 'rgba(46,204,113,0.15)', color: '#2ecc71' }}>🎟️</div>
              <div className="stat-num">{stats?.totalBookings || 0}</div>
              <div className="stat-label">Confirmed Bookings</div>
            </div>
          </div>
          <div className="stat-card card">
            <div className="card-body">
              <div className="stat-icon" style={{ background: 'rgba(155,89,182,0.15)', color: '#9b59b6' }}>👥</div>
              <div className="stat-num">{stats?.totalUsers || 0}</div>
              <div className="stat-label">Registered Users</div>
            </div>
          </div>
          <div className="stat-card card">
            <div className="card-body">
              <div className="stat-icon" style={{ background: 'rgba(244,200,66,0.15)', color: '#f4c842' }}>💰</div>
              <div className="stat-num">${(stats?.revenue || 0).toLocaleString()}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
        </div>

        <div className="admin-grid">
          {/* Recent Bookings */}
          <div className="admin-section card">
            <div className="card-body">
              <div className="section-header-row">
                <h3>Recent Bookings</h3>
                <Link to="/admin/bookings" className="btn btn-ghost btn-sm">View all →</Link>
              </div>
              <div className="admin-table">
                <div className="table-head">
                  <span>User</span><span>Event</span><span>Amount</span><span>Status</span>
                </div>
                {stats?.recentBookings?.slice(0, 8).map(b => (
                  <div key={b._id} className="table-row">
                    <span className="tr-user">{b.user?.name}</span>
                    <span className="tr-event">{b.event?.title}</span>
                    <span className="tr-amount">${b.totalAmount}</span>
                    <span className={`badge badge-${b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'error' : 'warning'}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="admin-section card">
            <div className="card-body">
              <div className="section-header-row">
                <h3>Upcoming Events</h3>
                <Link to="/admin/events" className="btn btn-ghost btn-sm">Manage →</Link>
              </div>
              {stats?.upcomingEvents?.map(e => (
                <div key={e._id} className="upcoming-event-row">
                  <div className="ue-date">
                    <div className="ue-day">{format(new Date(e.date), 'dd')}</div>
                    <div className="ue-month">{format(new Date(e.date), 'MMM')}</div>
                  </div>
                  <div className="ue-info">
                    <div className="ue-title">{e.title}</div>
                    <div className="ue-venue">{e.venue?.city} · {e.category}</div>
                  </div>
                  <div className="ue-bookings">{e.totalBookings} booked</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="quick-links">
          <Link to="/admin/events" className="quick-link card">
            <span className="ql-icon">🎪</span>
            <span className="ql-label">Manage Events</span>
            <span className="ql-arrow">→</span>
          </Link>
          <Link to="/events" className="quick-link card" target="_blank">
            <span className="ql-icon">👀</span>
            <span className="ql-label">View Public Site</span>
            <span className="ql-arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
