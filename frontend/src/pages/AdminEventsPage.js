import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { eventsAPI, adminAPI } from '../utils/api';
import './AdminEventsPage.css';

const CATEGORIES = ['Concert', 'Conference', 'Workshop', 'Sports', 'Exhibition', 'Festival', 'Networking', 'Other'];

const emptyForm = {
  title: '', description: '', category: 'Concert',
  image: '',
  venue: { name: '', address: '', city: '', country: '' },
  date: '', endDate: '',
  status: 'upcoming', featured: false, tags: '',
  ticketTiers: [{ name: 'General Admission', price: 0, totalSeats: 100, availableSeats: 100, description: '' }]
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchEvents = async () => {
    try {
      const { data } = await eventsAPI.getAll({ limit: 50 });
      setEvents(data.events);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleEdit = (event) => {
    setEditingId(event._id);
    setForm({
      ...event,
      date: event.date ? format(new Date(event.date), "yyyy-MM-dd'T'HH:mm") : '',
      endDate: event.endDate ? format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm") : '',
      tags: Array.isArray(event.tags) ? event.tags.join(', ') : '',
      ticketTiers: event.ticketTiers?.length ? event.ticketTiers : emptyForm.ticketTiers
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNew = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };

  const handleCancel = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };

  const handleTierChange = (i, field, value) => {
    const tiers = [...form.ticketTiers];
    tiers[i] = { ...tiers[i], [field]: field === 'price' || field === 'totalSeats' || field === 'availableSeats' ? Number(value) : value };
    if (field === 'totalSeats' && !editingId) tiers[i].availableSeats = Number(value);
    setForm({ ...form, ticketTiers: tiers });
  };

  const addTier = () => setForm({ ...form, ticketTiers: [...form.ticketTiers, { name: '', price: 0, totalSeats: 50, availableSeats: 50, description: '' }] });
  const removeTier = (i) => setForm({ ...form, ticketTiers: form.ticketTiers.filter((_, idx) => idx !== i) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        venue: form.venue
      };
      if (editingId) {
        await eventsAPI.update(editingId, payload);
        toast.success('Event updated!');
      } else {
        await eventsAPI.create(payload);
        toast.success('Event created!');
      }
      handleCancel();
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this event? This cannot be undone.')) return;
    try {
      await eventsAPI.delete(id);
      toast.success('Event cancelled');
      fetchEvents();
    } catch (err) { toast.error('Failed'); }
  };

  const handleFeature = async (id, featured) => {
    try {
      await adminAPI.featureEvent(id, !featured);
      toast.success(featured ? 'Removed from featured' : 'Added to featured');
      fetchEvents();
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <div className="admin-events-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Manage Events</h1>
            <p className="text-muted">{events.length} total events</p>
          </div>
          <button className="btn btn-primary" onClick={handleNew}>+ New Event</button>
        </div>

        {/* Event Form */}
        {showForm && (
          <div className="event-form-card card">
            <div className="card-body">
              <h2 className="form-title">{editingId ? 'Edit Event' : 'Create New Event'}</h2>
              <form onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div className="form-section-title">Basic Information</div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Event Title *</label>
                    <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Summer Music Festival 2025" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea className="form-textarea" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required placeholder="Describe the event..." />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input className="form-input" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (comma-separated)</label>
                    <input className="form-input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="music, outdoor, family" />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      {['upcoming', 'ongoing', 'completed', 'cancelled'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Featured</label>
                    <label className="toggle-label">
                      <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
                      <span className="toggle-text">{form.featured ? '⭐ Featured on homepage' : 'Not featured'}</span>
                    </label>
                  </div>
                </div>

                {/* Date */}
                <div className="form-section-title">Date & Time</div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Start Date & Time *</label>
                    <input type="datetime-local" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date & Time</label>
                    <input type="datetime-local" className="form-input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                </div>

                {/* Venue */}
                <div className="form-section-title">Venue</div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Venue Name *</label>
                    <input className="form-input" value={form.venue.name} onChange={e => setForm({ ...form, venue: { ...form.venue, name: e.target.value } })} required placeholder="Madison Square Garden" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address *</label>
                    <input className="form-input" value={form.venue.address} onChange={e => setForm({ ...form, venue: { ...form.venue, address: e.target.value } })} required placeholder="4 Pennsylvania Plaza" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input className="form-input" value={form.venue.city} onChange={e => setForm({ ...form, venue: { ...form.venue, city: e.target.value } })} required placeholder="New York" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country *</label>
                    <input className="form-input" value={form.venue.country} onChange={e => setForm({ ...form, venue: { ...form.venue, country: e.target.value } })} required placeholder="United States" />
                  </div>
                </div>

                {/* Ticket Tiers */}
                <div className="form-section-title">
                  Ticket Tiers
                  <button type="button" className="btn btn-secondary btn-sm" style={{ marginLeft: 12 }} onClick={addTier}>+ Add Tier</button>
                </div>
                {form.ticketTiers.map((tier, i) => (
                  <div key={i} className="tier-form-row">
                    <div className="tier-form-grid">
                      <div className="form-group">
                        <label className="form-label">Tier Name</label>
                        <input className="form-input" value={tier.name} onChange={e => handleTierChange(i, 'name', e.target.value)} required placeholder="VIP / General / Early Bird" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Price ($)</label>
                        <input type="number" min="0" className="form-input" value={tier.price} onChange={e => handleTierChange(i, 'price', e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Total Seats</label>
                        <input type="number" min="1" className="form-input" value={tier.totalSeats} onChange={e => handleTierChange(i, 'totalSeats', e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Available</label>
                        <input type="number" min="0" className="form-input" value={tier.availableSeats} onChange={e => handleTierChange(i, 'availableSeats', e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <input className="form-input" value={tier.description} onChange={e => handleTierChange(i, 'description', e.target.value)} placeholder="Optional perks" />
                      </div>
                      {form.ticketTiers.length > 1 && (
                        <button type="button" className="btn btn-danger btn-sm tier-remove" onClick={() => removeTier(i)}>✕</button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Events Table */}
        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : (
          <div className="events-table card">
            <div className="card-body" style={{ padding: 0 }}>
              <div className="et-head">
                <span>Event</span><span>Date</span><span>Category</span><span>Bookings</span><span>Status</span><span>Actions</span>
              </div>
              {events.length === 0 ? (
                <div className="empty-state" style={{ padding: '60px 24px' }}>
                  <div className="empty-icon">🎪</div>
                  <h3>No events yet</h3>
                  <p>Create your first event to get started</p>
                </div>
              ) : events.map(e => (
                <div key={e._id} className="et-row">
                  <div className="et-event">
                    <div className="et-title">{e.title}</div>
                    <div className="et-venue">{e.venue?.city}</div>
                    {e.featured && <span className="badge badge-accent" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>⭐ Featured</span>}
                  </div>
                  <span className="et-date">{format(new Date(e.date), 'MMM d, yyyy')}</span>
                  <span className="badge badge-muted">{e.category}</span>
                  <span className="et-bookings">{e.totalBookings}</span>
                  <span className={`badge ${e.status === 'upcoming' ? 'badge-success' : e.status === 'cancelled' ? 'badge-error' : 'badge-muted'}`}>{e.status}</span>
                  <div className="et-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => handleFeature(e._id, e.featured)} title={e.featured ? 'Unfeature' : 'Feature'}>
                      {e.featured ? '⭐' : '☆'}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(e)}>Edit</button>
                    {e.status !== 'cancelled' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e._id)}>Cancel</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
