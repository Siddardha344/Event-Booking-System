const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, adminOnly } = require('../middleware/auth');

// @route GET /api/events — public, with filters
router.get('/', async (req, res) => {
  try {
    const { category, city, search, status = 'upcoming', page = 1, limit = 12, featured } = req.query;
    const query = {};
    if (category) query.category = category;
    if (city) query['venue.city'] = new RegExp(city, 'i');
    if (status) query.status = status;
    if (featured === 'true') query.featured = true;
    if (search) query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { tags: new RegExp(search, 'i') }
    ];

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ events, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/events — admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    res.status(201).json({ event });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route PUT /api/events/:id — admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route DELETE /api/events/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/events/:id/availability
router.get('/:id/availability', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select('ticketTiers status date');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const availability = event.ticketTiers.map(t => ({
      name: t.name,
      price: t.price,
      availableSeats: t.availableSeats,
      totalSeats: t.totalSeats,
      available: t.availableSeats > 0
    }));
    res.json({ availability, eventStatus: event.status, eventDate: event.date });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
