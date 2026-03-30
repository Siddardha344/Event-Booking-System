import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { eventsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './EventDetailPage.css';

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    eventsAPI.getById(id)
      .then(({ data }) => { setEvent(data.event); if (data.event.ticketTiers?.length) setSelectedTier(data.event.ticketTiers[0].name); })
      .catch(() => navigate('/events'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!event) return null;

  const tier = event.ticketTiers?.find(t => t.name === selectedTier);
  const totalPrice = tier ? tier.price * quantity : 0;
  const isSoldOut = !event.ticketTiers?.some(t => t.availableSeats > 0);
  const isCancelled = event.status === 'cancelled';

  const handleBook = () => {
    if (!user) return navigate('/login');
    navigate(`/booking/${event._id}`, { state: { tierName: selectedTier, quantity } });
  };

  return (
    <div className="event-detail-page">
      {/* Hero Banner */}
      <div className="event-hero" style={{ backgroundImage: event.image ? `url(${event.image})` : 'none' }}>
        <div className="event-hero-overlay" />
        {!event.image && <div className="event-hero-placeholder">🎪</div>}
        <div className="container event-hero-content">
          <div className="event-breadcrumb">
            <Link to="/events">Events</Link> / <span>{event.category}</span>
          </div>
          <span className="badge badge-primary">{event.category}</span>
          <h1 className="event-hero-title">{event.title}</h1>
          <div className="event-hero-meta">
            <span>📅 {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
            <span>🕐 {format(new Date(event.date), 'h:mm a')}</span>
            <span>📍 {event.venue?.name}, {event.venue?.city}</span>
          </div>
        </div>
      </div>

      <div className="container event-detail-body">
        <div className="event-detail-grid">
          {/* Left: Info */}
          <div className="event-info">
            {isCancelled && (
              <div className="alert alert-error">⚠️ This event has been cancelled.</div>
            )}

            <section className="info-section">
              <h2>About This Event</h2>
              <p className="event-description">{event.description}</p>
            </section>

            <section className="info-section">
              <h2>Venue</h2>
              <div className="venue-card">
                <div className="venue-icon">📍</div>
                <div>
                  <div className="venue-name">{event.venue?.name}</div>
                  <div className="venue-address">{event.venue?.address}</div>
                  <div className="venue-city">{event.venue?.city}, {event.venue?.country}</div>
                </div>
              </div>
            </section>

            {event.tags?.length > 0 && (
              <section className="info-section">
                <h2>Tags</h2>
                <div className="event-tags">
                  {event.tags.map(tag => <span key={tag} className="badge badge-muted">#{tag}</span>)}
                </div>
              </section>
            )}

            <section className="info-section">
              <h2>Organizer</h2>
              <div className="organizer-card">
                <div className="organizer-avatar">{event.organizer?.name?.charAt(0)}</div>
                <div>
                  <div className="organizer-name">{event.organizer?.name}</div>
                  <div className="organizer-label">Event Organizer</div>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Booking */}
          <div className="booking-sidebar">
            <div className="booking-card card">
              <div className="card-body">
                <h3 className="booking-title">Get Tickets</h3>

                <div className="ticket-tiers">
                  {event.ticketTiers?.map(t => (
                    <div
                      key={t.name}
                      className={`tier-option ${selectedTier === t.name ? 'selected' : ''} ${t.availableSeats === 0 ? 'sold-out' : ''}`}
                      onClick={() => t.availableSeats > 0 && setSelectedTier(t.name)}
                    >
                      <div className="tier-left">
                        <div className="tier-name">{t.name}</div>
                        {t.description && <div className="tier-desc">{t.description}</div>}
                        <div className="tier-seats">{t.availableSeats === 0 ? '❌ Sold Out' : `✅ ${t.availableSeats} remaining`}</div>
                      </div>
                      <div className="tier-price">${t.price}</div>
                    </div>
                  ))}
                </div>

                <div className="quantity-row">
                  <label className="form-label">Quantity</label>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                    <span className="qty-num">{quantity}</span>
                    <button className="qty-btn" onClick={() => setQuantity(Math.min(tier?.availableSeats || 10, quantity + 1))}>+</button>
                  </div>
                </div>

                <div className="price-summary">
                  <div className="price-row">
                    <span>{tier?.name} × {quantity}</span>
                    <span>${(tier?.price || 0) * quantity}</span>
                  </div>
                  <div className="price-row total">
                    <span>Total</span>
                    <span className="total-price">${totalPrice}</span>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-full btn-lg"
                  disabled={isSoldOut || isCancelled}
                  onClick={handleBook}
                >
                  {isCancelled ? 'Event Cancelled' : isSoldOut ? 'Sold Out' : `Book Now — $${totalPrice}`}
                </button>
                <p className="booking-note">🔒 Secure checkout · Instant confirmation</p>
              </div>
            </div>

            {/* Quick Info */}
            <div className="quick-info card">
              <div className="card-body">
                <div className="qi-item"><span>📅</span><div><div className="qi-label">Date</div><div className="qi-value">{format(new Date(event.date), 'MMM d, yyyy')}</div></div></div>
                <div className="qi-item"><span>🕐</span><div><div className="qi-label">Time</div><div className="qi-value">{format(new Date(event.date), 'h:mm a')}</div></div></div>
                <div className="qi-item"><span>📍</span><div><div className="qi-label">Venue</div><div className="qi-value">{event.venue?.city}</div></div></div>
                <div className="qi-item"><span>🏷️</span><div><div className="qi-label">Status</div><div className={`qi-value status-${event.status}`}>{event.status}</div></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
