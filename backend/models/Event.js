const mongoose = require('mongoose');

const ticketTierSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., General, VIP, Early Bird
  price: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  description: { type: String, default: '' }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Concert', 'Conference', 'Workshop', 'Sports', 'Exhibition', 'Festival', 'Networking', 'Other'],
    required: true
  },
  image: { type: String, default: '' },
  venue: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  date: { type: Date, required: true },
  endDate: { type: Date },
  ticketTiers: [ticketTierSchema],
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  featured: { type: Boolean, default: false },
  tags: [{ type: String }],
  totalBookings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

eventSchema.index({ date: 1, status: 1, category: 1 });

module.exports = mongoose.model('Event', eventSchema);
