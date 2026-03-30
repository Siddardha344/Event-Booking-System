import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventsAPI } from '../utils/api';
import EventCard from '../components/EventCard';
import './EventsPage.css';

const CATEGORIES = ['All', 'Concert', 'Conference', 'Workshop', 'Sports', 'Exhibition', 'Festival', 'Networking', 'Other'];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const featured = searchParams.get('featured') || '';

  const [localSearch, setLocalSearch] = useState(search);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (city) params.city = city;
      if (featured) params.featured = featured;
      const { data } = await eventsAPI.getAll(params);
      setEvents(data.events);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, city, page, featured]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam('search', localSearch);
  };

  return (
    <div className="events-page">
      <div className="container">
        {/* Header */}
        <div className="events-header">
          <h1 className="page-title">Browse Events</h1>
          <p className="page-subtitle text-muted">{total > 0 ? `${total} events found` : 'Discover your next experience'}</p>
        </div>

        {/* Filters Row */}
        <div className="filters-row">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="form-input"
              placeholder="Search events..."
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <input
            type="text"
            className="form-input city-filter"
            placeholder="📍 Filter by city..."
            value={city}
            onChange={e => updateParam('city', e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`cat-tab ${(cat === 'All' ? !category : category === cat) ? 'active' : ''}`}
              onClick={() => updateParam('category', cat === 'All' ? '' : cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No events found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className="grid-4">
              {events.map(e => <EventCard key={e._id} event={e} />)}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === 1}
                  onClick={() => updateParam('page', page - 1)}
                >← Prev</button>
                <span className="page-info">Page {page} of {pages}</span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === pages}
                  onClick={() => updateParam('page', page + 1)}
                >Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
