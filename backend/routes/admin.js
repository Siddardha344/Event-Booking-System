const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes are protected
router.use(protect, adminOnly);

// @route GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalEvents, totalBookings, totalUsers, revenueResult] = await Promise.all([
      Event.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      User.countDocuments({ role: 'user' }),
      Booking.aggregate([
        { $match: { status: 'confirmed', paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    const revenue = revenueResult[0]?.total || 0;

    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('event', 'title date')
      .sort({ createdAt: -1 })
      .limit(10);

    const upcomingEvents = await Event.find({ status: 'upcoming' })
      .sort({ date: 1 })
      .limit(5);

    res.json({ totalEvents, totalBookings, totalUsers, revenue, recentBookings, upcomingEvents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('event', 'title date venue')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Booking.countDocuments(query);
    res.json({ bookings, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/admin/events/:id/feature
router.put('/events/:id/feature', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { featured: req.body.featured },
      { new: true }
    );
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
