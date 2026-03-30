import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { eventsAPI, paymentsAPI, bookingsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './BookingPage.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#f0f0f8',
      fontFamily: 'DM Sans, sans-serif',
      '::placeholder': { color: '#555570' },
      iconColor: '#e8472a',
    },
    invalid: { color: '#e74c3c' }
  }
};

function CheckoutForm({ event, tierName, quantity, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attendeeInfo, setAttendeeInfo] = useState({ name: user?.name || '', email: user?.email || '', phone: '' });

  const tier = event.ticketTiers?.find(t => t.name === tierName);
  const total = (tier?.price || 0) * quantity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError(''); setLoading(true);

    try {
      // Create payment intent
      const { data } = await paymentsAPI.createIntent({ eventId: event._id, tierName, quantity });
      const { clientSecret, paymentIntentId } = data;

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: attendeeInfo.name, email: attendeeInfo.email }
        }
      });

      if (result.error) throw new Error(result.error.message);

      // Create booking in DB
      const { data: bookingData } = await bookingsAPI.create({
        eventId: event._id, tierName, quantity, paymentIntentId, attendeeInfo
      });

      toast.success('🎉 Booking confirmed! Check your email.');
      onSuccess(bookingData.booking);
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="form-section">
        <h3>Attendee Information</h3>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-input" value={attendeeInfo.name} onChange={e => setAttendeeInfo({ ...attendeeInfo, name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" value={attendeeInfo.email} onChange={e => setAttendeeInfo({ ...attendeeInfo, email: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Phone (optional)</label>
          <input className="form-input" value={attendeeInfo.phone} onChange={e => setAttendeeInfo({ ...attendeeInfo, phone: e.target.value })} placeholder="+1 234 567 8900" />
        </div>
      </div>

      <div className="form-section">
        <h3>Payment Details</h3>
        <div className="card-element-wrap">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="card-note">🔒 Powered by Stripe — your info is always encrypted</p>
        <p className="test-note">Test card: <code>4242 4242 4242 4242</code> — any future date, any CVC</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading || !stripe}>
        {loading ? 'Processing Payment...' : `Pay $${total} — Confirm Booking`}
      </button>
    </form>
  );
}

export default function BookingPage() {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(null);

  const tierName = location.state?.tierName;
  const quantity = location.state?.quantity || 1;

  useEffect(() => {
    if (!tierName) { navigate(`/events/${eventId}`); return; }
    eventsAPI.getById(eventId)
      .then(({ data }) => setEvent(data.event))
      .catch(() => navigate('/events'))
      .finally(() => setLoading(false));
  }, [eventId, tierName, navigate]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!event) return null;

  if (confirmed) {
    return (
      <div className="booking-success">
        <div className="success-card card">
          <div className="card-body">
            <div className="success-icon">🎉</div>
            <h2>Booking Confirmed!</h2>
            <p>Your tickets are booked. A confirmation email has been sent.</p>
            <div className="booking-code-display">
              <div className="bc-label">Booking Code</div>
              <div className="bc-value">{confirmed.bookingCode}</div>
            </div>
            <div className="success-actions">
              <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>View My Bookings</button>
              <button className="btn btn-secondary" onClick={() => navigate('/events')}>Browse More Events</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tier = event.ticketTiers?.find(t => t.name === tierName);
  const total = (tier?.price || 0) * quantity;

  return (
    <div className="booking-page">
      <div className="container">
        <div className="booking-grid">
          {/* Left: Payment Form */}
          <div>
            <h1 className="booking-page-title">Complete Your Booking</h1>
            <Elements stripe={stripePromise}>
              <CheckoutForm event={event} tierName={tierName} quantity={quantity} onSuccess={setConfirmed} />
            </Elements>
          </div>

          {/* Right: Order Summary */}
          <div className="order-summary">
            <div className="card">
              <div className="card-body">
                <h3>Order Summary</h3>
                <div className="os-event">
                  <div className="os-event-title">{event.title}</div>
                  <div className="os-event-meta">📅 {format(new Date(event.date), 'MMM d, yyyy · h:mm a')}</div>
                  <div className="os-event-meta">📍 {event.venue?.name}, {event.venue?.city}</div>
                </div>
                <div className="os-divider" />
                <div className="os-line">
                  <span>{tierName} × {quantity}</span>
                  <span>${tier?.price} each</span>
                </div>
                <div className="os-line total">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
