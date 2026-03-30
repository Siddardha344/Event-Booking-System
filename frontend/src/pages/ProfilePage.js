import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/auth/profile', form);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  return (
    <div className="profile-page">
      <div className="container-sm">
        <div className="page-header" style={{ textAlign: 'left', background: 'none', border: 'none', padding: '48px 0 32px' }}>
          <h1 className="page-title">My Profile</h1>
        </div>

        <div className="profile-grid">
          {/* Avatar Card */}
          <div className="profile-avatar-card card">
            <div className="card-body text-center">
              <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div className="profile-name">{user?.name}</div>
              <div className="profile-email text-muted">{user?.email}</div>
              <div className="profile-role">
                <span className={`badge ${user?.role === 'admin' ? 'badge-accent' : 'badge-primary'}`}>
                  {user?.role === 'admin' ? '⚙️ Admin' : '🎟️ Attendee'}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="profile-form-card card">
            <div className="card-body">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '24px' }}>Edit Profile</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" value={user?.email} disabled style={{ opacity: 0.5 }} />
                  <small className="text-muted" style={{ fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>Email cannot be changed</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 8900" />
                </div>
                <div className="form-group">
                  <label className="form-label">Avatar URL</label>
                  <input className="form-input" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." />
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats card mt-24">
          <div className="card-body">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '20px' }}>Account Info</h3>
            <div className="profile-stat-row">
              <span className="text-muted">Member Since</span>
              <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
            </div>
            <div className="profile-stat-row">
              <span className="text-muted">Total Bookings</span>
              <span>{user?.bookings?.length || 0}</span>
            </div>
            <div className="profile-stat-row">
              <span className="text-muted">Account Type</span>
              <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
