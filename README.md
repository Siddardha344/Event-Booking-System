# 🎭 EventBook — Full-Stack Event Booking System

A production-ready MERN stack event booking platform inspired by Eventbrite and Ticketmaster. Built with MongoDB, Express.js, React, and Node.js.

---

## 📸 Screenshots

> Add screenshots of your running app here before submission.  
> Pages to capture: Home, Events Browse, Event Detail, Booking/Checkout, My Bookings, Admin Dashboard, Admin Events Manager, Login/Register.

---

## ✨ Features

### User-Facing
- 🔍 **Browse Events** — Search, filter by category, city, and featured status with pagination
- 🎟️ **Ticket Tiers** — Multiple ticket types (General, VIP, Early Bird) with real-time seat availability
- 💳 **Secure Payments** — Stripe integration with test mode support
- 📬 **Email Confirmations** — Automated booking confirmation emails via Nodemailer
- ⏰ **Event Reminders** — Cron-job driven 24-hour pre-event reminder emails
- 📋 **My Bookings** — View, filter, and cancel bookings
- 👤 **User Profile** — Update personal info and view account stats
- 🔐 **Authentication** — JWT-based login/register with protected routes

### Admin
- 📊 **Dashboard** — Revenue stats, booking counts, user counts, recent activity
- 🎪 **Event Management** — Create, edit, cancel, and feature events with full CRUD
- 🎫 **Ticket Tier Management** — Add/remove multiple ticket tiers with custom pricing
- 👥 **User Management** — View all registered users

### Technical
- Responsive design — works on all screen sizes
- Role-based access control (Admin / User)
- Real-time seat availability tracking
- Stripe webhook handling
- Input validation (server + client)

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18.2.0 |
| Routing | React Router DOM | 6.21.1 |
| Payments | Stripe React + Stripe.js | 2.4.0 / 3.0.0 |
| HTTP Client | Axios | 1.6.2 |
| Date Utilities | date-fns | 3.0.6 |
| Notifications | React Toastify | 10.0.4 |
| Backend | Node.js | 18+ |
| Framework | Express.js | 4.18.2 |
| Database | MongoDB | 7.x |
| ODM | Mongoose | 8.0.3 |
| Auth | JSON Web Tokens | 9.0.2 |
| Password Hashing | bcryptjs | 2.4.3 |
| Email | Nodemailer | 6.9.7 |
| Payment API | Stripe | 14.9.0 |
| Cron Jobs | node-cron | 3.0.3 |
| Validation | express-validator | 7.0.1 |

---

## ⚙️ Local Setup

### Prerequisites

| Tool | Minimum Version | Download |
|------|----------------|----------|
| Node.js | v18.0.0 | https://nodejs.org |
| npm | v9.0.0 | bundled with Node |
| MongoDB | v6.0+ | https://www.mongodb.com/try/download/community |
| Git | v2.x | https://git-scm.com |

> Verify your versions:
> ```bash
> node --version   # Should be v18+
> npm --version    # Should be v9+
> mongod --version # Should be v6+
> ```

---

### Step-by-Step Setup

#### 1. Clone the repository

```bash
git clone <your-repo-url>
cd event-booking
```

#### 2. Install all dependencies

```bash
# Install root-level concurrently
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

#### 3. Configure environment variables

**Backend** — copy and edit `.env`:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventbooking
JWT_SECRET=your_super_secret_key_here_make_it_long
JWT_EXPIRE=7d

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Email (use Gmail App Password or Mailtrap for testing)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=EventBook <noreply@eventbook.com>

CLIENT_URL=http://localhost:3000
```

**Frontend** — copy and edit `.env`:

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
```

#### 4. Start MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
net start MongoDB

# Or run directly
mongod --dbpath /data/db
```

#### 5. Seed the database (optional but recommended)

```bash
node backend/seed.js
```

This creates:
- **Admin account:** `admin@demo.com` / `admin123`
- **User account:** `user@demo.com` / `user123`
- **8 sample events** across all categories

#### 6. Run the application

**Option A: Run both simultaneously (recommended)**
```bash
npm run dev
```

**Option B: Run separately**
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

#### 7. Open in browser

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/health

---

## 💳 Stripe Test Mode

For payments, use Stripe test cards:

| Scenario | Card Number | Expiry | CVC |
|----------|-------------|--------|-----|
| Successful payment | `4242 4242 4242 4242` | Any future date | Any 3 digits |
| Payment declined | `4000 0000 0000 9995` | Any future date | Any 3 digits |
| Requires auth | `4000 0025 0000 3155` | Any future date | Any 3 digits |

No real money is charged in test mode.

---

## 📁 Project Structure

```
event-booking/
├── backend/
│   ├── controllers/
│   │   └── notificationController.js   # Email & reminders
│   ├── middleware/
│   │   └── auth.js                     # JWT middleware
│   ├── models/
│   │   ├── User.js                     # User schema
│   │   ├── Event.js                    # Event + ticket tiers schema
│   │   └── Booking.js                  # Booking schema
│   ├── routes/
│   │   ├── auth.js                     # Register, login, profile
│   │   ├── events.js                   # CRUD + availability
│   │   ├── bookings.js                 # Create, cancel, list
│   │   ├── payments.js                 # Stripe intents + webhook
│   │   └── admin.js                    # Admin-only stats & management
│   ├── seed.js                         # Database seeder
│   ├── server.js                       # Express app + cron jobs
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js / .css
│   │   │   ├── Footer.js / .css
│   │   │   └── EventCard.js / .css
│   │   ├── context/
│   │   │   └── AuthContext.js          # Global auth state
│   │   ├── pages/
│   │   │   ├── HomePage.js             # Landing + featured events
│   │   │   ├── EventsPage.js           # Browse + filter
│   │   │   ├── EventDetailPage.js      # Event info + booking widget
│   │   │   ├── BookingPage.js          # Stripe checkout
│   │   │   ├── MyBookingsPage.js       # User's tickets
│   │   │   ├── AuthPages.js            # Login + Register
│   │   │   ├── ProfilePage.js          # User profile
│   │   │   ├── AdminDashboard.js       # Admin overview
│   │   │   └── AdminEventsPage.js      # Event CRUD
│   │   ├── utils/
│   │   │   └── api.js                  # Axios API helpers
│   │   ├── App.js                      # Routes
│   │   ├── index.js
│   │   └── index.css                   # Design system
│   ├── package.json
│   └── .env.example
│
├── package.json                        # Root scripts
└── README.md
```

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | User | Get current user |
| PUT | `/api/auth/profile` | User | Update profile |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events` | — | List events (filterable) |
| GET | `/api/events/:id` | — | Event detail |
| GET | `/api/events/:id/availability` | — | Seat availability |
| POST | `/api/events` | Admin | Create event |
| PUT | `/api/events/:id` | Admin | Update event |
| DELETE | `/api/events/:id` | Admin | Cancel event |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | User | Create booking |
| GET | `/api/bookings/my` | User | My bookings |
| GET | `/api/bookings/:id` | User | Booking detail |
| PUT | `/api/bookings/:id/cancel` | User | Cancel booking |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/create-intent` | User | Create Stripe payment intent |
| POST | `/api/payments/webhook` | — | Stripe webhook handler |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/bookings` | Admin | All bookings |
| GET | `/api/admin/users` | Admin | All users |
| PUT | `/api/admin/events/:id/feature` | Admin | Feature/unfeature event |

---

## 🚀 Deployment (Optional)

- **Backend:** Deploy to Render, Railway, or Heroku. Set env variables in dashboard.
- **Frontend:** Deploy to Vercel or Netlify. Set `REACT_APP_API_URL` to your backend URL.
- **Database:** Use MongoDB Atlas (free tier) for cloud MongoDB.

---

## 👨‍💻 Author

Built as part of a MERN Stack developer assessment.

Real-world inspiration: [Eventbrite](https://www.eventbrite.com) · [Ticketmaster](https://www.ticketmaster.com)
