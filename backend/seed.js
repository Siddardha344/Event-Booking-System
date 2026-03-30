const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Event = require('./models/Event');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventbooking';

const sampleEvents = [
  {
    title: 'Neon Dreams Music Festival',
    description: 'A three-day outdoor music festival featuring top international artists across multiple stages. Experience breathtaking performances, immersive art installations, and unforgettable nights under the stars. Food vendors, craft stalls, and family zones make this the complete festival experience.',
    category: 'Festival',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    venue: { name: 'Golden Gate Park', address: '501 Stanyan St', city: 'San Francisco', country: 'United States' },
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
    status: 'upcoming', featured: true,
    tags: ['music', 'festival', 'outdoor', 'arts'],
    ticketTiers: [
      { name: 'General Admission', price: 149, totalSeats: 5000, availableSeats: 3200, description: '3-day access to all stages' },
      { name: 'VIP', price: 349, totalSeats: 500, availableSeats: 120, description: 'VIP lounge, priority entry, artist meet & greet' },
      { name: 'Early Bird', price: 99, totalSeats: 1000, availableSeats: 0, description: 'Limited early access — sold out!' }
    ]
  },
  {
    title: 'TechForward 2025 Conference',
    description: 'Join 2,000+ tech leaders, founders, and innovators for two days of keynotes, panels, and workshops. This year\'s theme is "Building for Billions" — exploring AI, sustainability, and the future of human-computer interaction.',
    category: 'Conference',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    venue: { name: 'Moscone Center', address: '747 Howard St', city: 'San Francisco', country: 'United States' },
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'upcoming', featured: true,
    tags: ['tech', 'ai', 'startup', 'innovation'],
    ticketTiers: [
      { name: 'Standard', price: 299, totalSeats: 1500, availableSeats: 800 },
      { name: 'Premium', price: 599, totalSeats: 300, availableSeats: 85, description: 'All sessions + networking dinner + recordings' },
      { name: 'Student', price: 99, totalSeats: 200, availableSeats: 140, description: 'Valid student ID required' }
    ]
  },
  {
    title: 'Jazz Under the Stars',
    description: 'An intimate evening of world-class jazz performances in a stunning open-air amphitheater. Featuring Grammy-winning artists and exciting newcomers, this is the perfect date night or evening out with friends. Bring a blanket and enjoy the music under a canopy of stars.',
    category: 'Concert',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    venue: { name: 'Hollywood Bowl', address: '2301 N Highland Ave', city: 'Los Angeles', country: 'United States' },
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'upcoming', featured: false,
    tags: ['jazz', 'live music', 'outdoor', 'evening'],
    ticketTiers: [
      { name: 'Lawn', price: 45, totalSeats: 2000, availableSeats: 1100 },
      { name: 'Reserved', price: 89, totalSeats: 800, availableSeats: 320 },
      { name: 'Box Seats', price: 199, totalSeats: 100, availableSeats: 22, description: 'Premium box seating with table service' }
    ]
  },
  {
    title: 'Full-Stack Web Dev Bootcamp',
    description: 'An intensive 2-day hands-on workshop covering React, Node.js, MongoDB and deployment. Build a real-world application from scratch with expert guidance. Limited seats ensure personalized attention for every participant.',
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    venue: { name: 'WeWork Downtown', address: '600 Congress Ave', city: 'Austin', country: 'United States' },
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    status: 'upcoming', featured: false,
    tags: ['coding', 'react', 'nodejs', 'web development'],
    ticketTiers: [
      { name: 'General', price: 199, totalSeats: 40, availableSeats: 18, description: 'Full 2-day workshop + materials' }
    ]
  },
  {
    title: 'NBA All-Star Weekend',
    description: 'The biggest basketball spectacle of the year! Watch the world\'s best players in the Skills Challenge, 3-Point Contest, and the electrifying All-Star Game. An unforgettable celebration of basketball culture.',
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1546519638405-a9f8a7b8e8e5?w=800',
    venue: { name: 'Chase Center', address: '300 16th St', city: 'San Francisco', country: 'United States' },
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    status: 'upcoming', featured: true,
    tags: ['basketball', 'nba', 'sports', 'celebrity'],
    ticketTiers: [
      { name: 'Upper Level', price: 125, totalSeats: 3000, availableSeats: 2100 },
      { name: 'Lower Level', price: 299, totalSeats: 1500, availableSeats: 450 },
      { name: 'Courtside', price: 1499, totalSeats: 80, availableSeats: 12, description: 'Courtside seats + pre-game access' }
    ]
  },
  {
    title: 'Modern Art & Design Exhibition',
    description: 'Explore five decades of groundbreaking contemporary art across 20 stunning galleries. This landmark exhibition brings together over 300 works from 80 artists across 25 countries, exploring themes of identity, technology, and the natural world.',
    category: 'Exhibition',
    image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800',
    venue: { name: 'SFMOMA', address: '151 3rd St', city: 'San Francisco', country: 'United States' },
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: 'upcoming', featured: false,
    tags: ['art', 'design', 'contemporary', 'culture'],
    ticketTiers: [
      { name: 'Adult', price: 25, totalSeats: 500, availableSeats: 380 },
      { name: 'Student/Senior', price: 15, totalSeats: 200, availableSeats: 165 },
      { name: 'Member', price: 0, totalSeats: 100, availableSeats: 78, description: 'Free for museum members' }
    ]
  },
  {
    title: 'Startup Founders Networking Night',
    description: 'Connect with 300+ founders, investors, and startup enthusiasts in a casual evening of structured networking. Speed networking sessions, investor pitches, and open networking with drinks and appetizers provided.',
    category: 'Networking',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
    venue: { name: 'The Battery', address: '717 Battery St', city: 'San Francisco', country: 'United States' },
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    status: 'upcoming', featured: false,
    tags: ['networking', 'startup', 'investors', 'entrepreneurship'],
    ticketTiers: [
      { name: 'General', price: 35, totalSeats: 250, availableSeats: 180 },
      { name: 'Investor Pass', price: 0, totalSeats: 50, availableSeats: 28, description: 'Complimentary for verified investors' }
    ]
  },
  {
    title: 'Electronic Music Showcase',
    description: 'A cutting-edge night of electronic music featuring resident DJs and international headliners. State-of-the-art sound system, immersive lighting, and laser shows create an otherworldly atmosphere.',
    category: 'Concert',
    image: 'https://images.unsplash.com/photo-1571266028241-8a7fa0e68ec5?w=800',
    venue: { name: 'The Warfield', address: '982 Market St', city: 'San Francisco', country: 'United States' },
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'upcoming', featured: false,
    tags: ['electronic', 'edm', 'nightlife', 'dj'],
    ticketTiers: [
      { name: 'General Admission', price: 55, totalSeats: 1200, availableSeats: 640 },
      { name: 'VIP Table', price: 199, totalSeats: 60, availableSeats: 18, description: 'Reserved table with bottle service' }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('👤 Admin created:', admin.email);

    // Create regular user
    const user = await User.create({
      name: 'Jane Doe',
      email: 'user@demo.com',
      password: 'user123',
      role: 'user'
    });
    console.log('👤 User created:', user.email);

    // Create events
    const events = await Event.insertMany(
      sampleEvents.map(e => ({ ...e, organizer: admin._id }))
    );
    console.log(`🎪 Created ${events.length} events`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Login:  admin@demo.com / admin123');
    console.log('User Login:   user@demo.com  / user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
