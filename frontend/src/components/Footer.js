import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">🎭 Event<strong>Book</strong></div>
            <p className="footer-tagline">Discover and book unforgettable experiences — concerts, conferences, festivals and more.</p>
          </div>
          <div className="footer-links-group">
            <h4>Explore</h4>
            <Link to="/events">Browse Events</Link>
            <Link to="/events?category=Concert">Concerts</Link>
            <Link to="/events?category=Conference">Conferences</Link>
            <Link to="/events?category=Festival">Festivals</Link>
          </div>
          <div className="footer-links-group">
            <h4>Account</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/my-bookings">My Bookings</Link>
            <Link to="/profile">Profile</Link>
          </div>
          <div className="footer-links-group">
            <h4>Support</h4>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact Us</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} EventBook. All rights reserved.</span>
          <div className="footer-socials">
            <a href="#twitter" aria-label="Twitter">🐦</a>
            <a href="#instagram" aria-label="Instagram">📸</a>
            <a href="#linkedin" aria-label="LinkedIn">💼</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
