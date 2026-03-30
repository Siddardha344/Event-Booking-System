const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/auth');
const Event = require('../models/Event');

// @route POST /api/payments/create-intent
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { eventId, tierName, quantity } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const tier = event.ticketTiers.find(t => t.name === tierName);
    if (!tier) return res.status(404).json({ message: 'Ticket tier not found' });
    if (tier.availableSeats < quantity) return res.status(400).json({ message: 'Not enough seats' });

    const amount = Math.round(tier.price * quantity * 100); // Stripe uses cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        eventId: eventId.toString(),
        tierName,
        quantity: quantity.toString(),
        userId: req.user._id.toString()
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: 'usd'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/payments/webhook — Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const Booking = require('../models/Booking');
    await Booking.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      { paymentStatus: 'paid', status: 'confirmed' }
    );
  }

  res.json({ received: true });
});

module.exports = router;
