import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { bookingsAPI } from '../utils/api';
import './MyBookingsPage.css';

const statusColors = { confirmed: 'success', pending: 'warning', cancelled: 'error', refunded: 'muted' };

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    bookingsAPI.getMyBookings()
      .then(({ data }) => setBookings(data.bookings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingsAPI.cancel(id);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="my-bookings-page">
      <div className="container">
        <div className="page-header" style={{ textAlign: 'left', background: 'none', border: 'none', padding: '48px 0 32px' }}>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle text-muted">Manage your event tickets</p>
        </div>

        {/* Filter Tabs */}
        <div className="booking-filters">
          {['all', 'confirmed', 'pending', 'cancelled'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' && <span className="filter-count">{bookings.length}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎟️</div>
            <h3>{filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}</h3>
            <p>Browse events and book your first experience</p>
            <Link to="/events" className="btn btn-primary mt-16">Browse Events</Link>
          </div>
        ) : (
          <div className="bookings-list">
            {filtered.map(b => (
              <div key={b._id} className={`booking-row card ${b.status === 'cancelled' ? 'booking-cancelled' : ''}`}>
                <div className="booking-event-img">
                  {b.event?.image ? (
                    <img src={b.event.image} alt={b.event?.title} />
                  ) : (
                    <div className="img-placeholder">🎪</div>
                  )}
                </div>
                <div className="booking-info">
                  <div className="booking-top">
                    <div>
                      <Link to={`/events/${b.event?._id}`} className="booking-event-title">{b.event?.title}</Link>
                      <div className="booking-meta">
                        <span>📅 {b.event?.date ? format(new Date(b.event.date), 'MMM d, yyyy · h:mm a') : 'TBD'}</span>
                        <span>📍 {b.event?.venue?.city}</span>
                      </div>
                    </div>
                    <span className={`badge badge-${statusColors[b.status]}`}>{b.status}</span>
                  </div>
                  <div className="booking-details">
                    <div className="bd-item"><span className="bd-label">Ticket</span><span className="bd-value">{b.ticketTier?.name}</span></div>
                    <div className="bd-item"><span className="bd-label">Qty</span><span className="bd-value">{b.quantity}</span></div>
                    <div className="bd-item"><span className="bd-label">Total</span><span className="bd-value bd-amount">${b.totalAmount}</span></div>
                    <div className="bd-item"><span className="bd-label">Code</span><span className="bd-value bd-code">{b.bookingCode}</span></div>
                  </div>
                </div>
                <div className="booking-actions">
                  {b.status === 'confirmed' && new Date(b.event?.date) > new Date() && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b._id)}>Cancel</button>
                  )}
                  <Link to={`/events/${b.event?._id}`} className="btn btn-secondary btn-sm">View Event</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
