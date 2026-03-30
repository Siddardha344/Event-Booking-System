const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { sendBookingConfirmation } = require('../controllers/notificationController');

// @route POST /api/bookings — create booking (after payment)
router.post('/', protect, async (req, res) => {
  try {
    const { eventId, tierName, quantity, paymentIntentId, attendeeInfo } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status === 'cancelled') return res.status(400).json({ message: 'Event is cancelled' });

    const tier = event.ticketTiers.find(t => t.name === tierName);
    if (!tier) return res.status(400).json({ message: 'Ticket tier not found' });
    if (tier.availableSeats < quantity) return res.status(400).json({ message: 'Not enough seats available' });

    // Deduct seats
    tier.availableSeats -= quantity;
    event.totalBookings += quantity;
    await event.save();

    const totalAmount = tier.price * quantity;
    const booking = await Booking.create({
      user: req.user._id,
      event: eventId,
      ticketTier: { name: tier.name, price: tier.price },
      quantity,
      totalAmount,
      status: 'confirmed',
      paymentStatus: paymentIntentId ? 'paid' : 'unpaid',
      paymentIntentId: paymentIntentId || '',
      attendeeInfo
    });

    // Add booking to user
    await User.findByIdAndUpdate(req.user._id, { $push: { bookings: booking._id } });

    // Send confirmation email (non-blocking)
    sendBookingConfirmation(req.user, event, booking).catch(console.error);

    const populated = await booking.populate([{ path: 'event', select: 'title date venue image' }]);
    res.status(201).json({ booking: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/bookings/my — user's bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title date venue image category status')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/bookings/:id — single booking
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event user');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/bookings/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

    // Restore seats
    await Event.findOneAndUpdate(
      { _id: booking.event, 'ticketTiers.name': booking.ticketTier.name },
      { $inc: { 'ticketTiers.$.availableSeats': booking.quantity, totalBookings: -booking.quantity } }
    );

    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
