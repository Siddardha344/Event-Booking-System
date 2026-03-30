const nodemailer = require('nodemailer');
const Booking = require('../models/Booking');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
};

const sendBookingConfirmation = async (user, event, booking) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🎉 Booking Confirmed!</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your booking for <strong>${event.title}</strong> has been confirmed!</p>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
          <p><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>📍 Venue:</strong> ${event.venue.name}, ${event.venue.city}</p>
          <p><strong>🎟️ Ticket:</strong> ${booking.ticketTier.name} x ${booking.quantity}</p>
          <p><strong>💰 Total:</strong> $${booking.totalAmount}</p>
          <p><strong>🔖 Booking Code:</strong> <code style="background: #eee; padding: 3px 8px; border-radius: 4px;">${booking.bookingCode}</code></p>
        </div>
        <p style="margin-top: 20px; color: #666;">See you at the event! 🎊</p>
      </div>
    </div>
  `;

  await sendEmail({ to: user.email, subject: `Booking Confirmed - ${event.title}`, html });
};

const sendEventReminders = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const bookings = await Booking.find({
    status: 'confirmed',
    reminderSent: false
  })
    .populate('user', 'name email')
    .populate('event', 'title date venue');

  for (const booking of bookings) {
    const eventDate = new Date(booking.event.date);
    if (eventDate >= tomorrow && eventDate < dayAfter) {
      try {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>⏰ Event Reminder - Tomorrow!</h2>
            <p>Hi ${booking.user.name}, your event <strong>${booking.event.title}</strong> is tomorrow!</p>
            <p>📍 ${booking.event.venue.name}, ${booking.event.venue.city}</p>
            <p>🔖 Booking Code: ${booking.bookingCode}</p>
          </div>
        `;
        await sendEmail({ to: booking.user.email, subject: `Reminder: ${booking.event.title} is Tomorrow!`, html });
        booking.reminderSent = true;
        await booking.save();
      } catch (err) {
        console.error('Reminder failed for', booking._id, err.message);
      }
    }
  }
};

module.exports = { sendBookingConfirmation, sendEventReminders, sendEmail };
