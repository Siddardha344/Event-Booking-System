import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventsAPI } from '../utils/api';
import EventCard from '../components/EventCard';
import './HomePage.css';

const CATEGORIES = ['Concert', 'Conference', 'Workshop', 'Sports', 'Exhibition', 'Festival', 'Networking'];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, upRes] = await Promise.all([
          eventsAPI.getAll({ featured: true, limit: 4 }),
          eventsAPI.getAll({ limit: 8, status: 'upcoming' })
        ]);
        setFeatured(featRes.data.events);
        setUpcoming(upRes.data.events);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="homepage">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
        </div>
        <div className="container hero-content">
          <div className="hero-label">🎟️ The Premier Event Platform</div>
          <h1 className="hero-title">
            Your Next<br />
            <span className="hero-highlight">Unforgettable</span><br />
            Experience Awaits
          </h1>
          <p className="hero-subtitle">Browse thousands of events — concerts, conferences, workshops & more. Book tickets in seconds.</p>

          <form className="hero-search" onSubmit={handleSearch}>
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search events, artists, venues..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg search-btn">Search</button>
          </form>

          <div className="hero-stats">
            <div className="stat"><span className="stat-num">10K+</span><span className="stat-label">Events</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">500K+</span><span className="stat-label">Happy Attendees</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">150+</span><span className="stat-label">Cities</span></div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="categories-section">
        <div className="container">
          <div className="categories-scroll">
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/events?category=${cat}`} className="category-pill">
                <span className="cat-icon">{getCatIcon(cat)}</span>
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featured.length > 0 && (
        <section className="home-section">
          <div className="container">
            <div className="section-header flex-between" style={{ textAlign: 'left', marginBottom: 32 }}>
              <div>
                <span className="section-label">✨ Handpicked</span>
                <h2 className="section-title" style={{ marginBottom: 0 }}>Featured Events</h2>
              </div>
              <Link to="/events?featured=true" className="btn btn-secondary btn-sm">View All →</Link>
            </div>
            <div className="grid-4">
              {featured.map(e => <EventCard key={e._id} event={e} />)}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section className="home-section">
        <div className="container">
          <div className="section-header flex-between" style={{ textAlign: 'left', marginBottom: 32 }}>
            <div>
              <span className="section-label">📅 Coming Soon</span>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Upcoming Events</h2>
            </div>
            <Link to="/events" className="btn btn-secondary btn-sm">Browse All →</Link>
          </div>
          {loading ? (
            <div className="loading-screen"><div className="spinner" /></div>
          ) : upcoming.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><h3>No upcoming events yet</h3></div>
          ) : (
            <div className="grid-4">
              {upcoming.map(e => <EventCard key={e._id} event={e} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Host Your Event With Us</h2>
              <p>Reach thousands of enthusiastic attendees. Manage your events effortlessly with our powerful admin tools.</p>
              <Link to="/register?role=admin" className="btn btn-accent btn-lg">Get Started →</Link>
            </div>
            <div className="cta-visual">🚀</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function getCatIcon(cat) {
  const map = { Concert: '🎵', Conference: '🎤', Workshop: '🛠️', Sports: '⚽', Exhibition: '🖼️', Festival: '🎪', Networking: '🤝' };
  return map[cat] || '🎟️';
}
