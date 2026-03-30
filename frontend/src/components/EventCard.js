import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import './EventCard.css';

const categoryColors = {
  Concert: '#e8472a',
  Conference: '#3498db',
  Workshop: '#9b59b6',
  Sports: '#2ecc71',
  Exhibition: '#f39c12',
  Festival: '#e91e8c',
  Networking: '#1abc9c',
  Other: '#95a5a6',
};

export default function EventCard({ event }) {
  const minPrice = event.ticketTiers?.length
    ? Math.min(...event.ticketTiers.map(t => t.price))
    : 0;
  const totalSeats = event.ticketTiers?.reduce((s, t) => s + t.totalSeats, 0) || 0;
  const availableSeats = event.ticketTiers?.reduce((s, t) => s + t.availableSeats, 0) || 0;
  const soldPercent = totalSeats ? ((totalSeats - availableSeats) / totalSeats) * 100 : 0;
  const isSoldOut = availableSeats === 0;
  const color = categoryColors[event.category] || '#888';

  return (
    <Link to={`/events/${event._id}`} className="event-card">
      <div className="event-card-image" style={{ backgroundImage: event.image ? `url(${event.image})` : 'none' }}>
        {!event.image && <div className="event-card-placeholder">{event.category?.charAt(0) || '🎪'}</div>}
        <div className="event-card-overlay" />
        <div className="event-card-badges">
          <span className="event-category-badge" style={{ background: color }}>{event.category}</span>
          {event.featured && <span className="event-featured-badge">⭐ Featured</span>}
          {isSoldOut && <span className="event-soldout-badge">Sold Out</span>}
        </div>
        <div className="event-card-date">
          <span className="date-day">{format(new Date(event.date), 'dd')}</span>
          <span className="date-month">{format(new Date(event.date), 'MMM')}</span>
        </div>
      </div>

      <div className="event-card-body">
        <h3 className="event-title">{event.title}</h3>
        <div className="event-meta">
          <span className="event-meta-item">📍 {event.venue?.city}</span>
          <span className="event-meta-item">🕐 {format(new Date(event.date), 'h:mm a')}</span>
        </div>
        <div className="event-venue">{event.venue?.name}</div>

        {totalSeats > 0 && (
          <div className="event-seats">
            <div className="seats-bar">
              <div className="seats-fill" style={{ width: `${soldPercent}%`, background: soldPercent > 80 ? '#e74c3c' : color }} />
            </div>
            <span className="seats-text">{isSoldOut ? 'Sold Out' : `${availableSeats} seats left`}</span>
          </div>
        )}

        <div className="event-card-footer">
          <div className="event-price">
            {minPrice === 0 ? <span className="price-free">Free</span> : (
              <><span className="price-from">from </span><span className="price-amount">${minPrice}</span></>
            )}
          </div>
          <span className="event-cta">View Details →</span>
        </div>
      </div>
    </Link>
  );
}
