const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticketTier: {
    name: { type: String, required: true },
    price: { type: Number, required: true }
  },
  quantity: { type: Number, required: true, min: 1, max: 10 },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  paymentIntentId: { type: String, default: '' },
  bookingCode: { type: String, unique: true },
  reminderSent: { type: Boolean, default: false },
  attendeeInfo: {
    name: String,
    email: String,
    phone: String
  },
  createdAt: { type: Date, default: Date.now }
});

// Generate booking code before saving
bookingSchema.pre('save', function (next) {
  if (!this.bookingCode) {
    this.bookingCode = 'EVT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
