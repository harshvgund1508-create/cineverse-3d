# CineVerse 3D — Full-Stack Cinematic Booking Platform
> *"Don't Just Book Your Seat. Experience Your View."*

**CineVerse 3D** is a movie ticket booking platform featuring an immersive 3D cinema auditorium built in Three.js and React Three Fiber. Users can enter a virtual theatre, watch official movie trailers directly on a giant 3D screen via WebGL `VideoTexture`, click individual seats (e.g. G8), glide the camera smoothly to that seat's exact eye-level coordinates, mathematically compare geometric viewing angles, lock seats in real time with backend conflict prevention, complete verified Razorpay payments, and receive cryptographic digital QR passes.

---

## 🌟 Signature Features

### 1. Interactive 3D Cinema Auditorium
- **3D Stadium Architecture**: 10 tiered stadium risers (Rows A to K), acoustically treated side walls with wood slat baffles and purple LED wash, cinema stage with neon underglow, drop ceiling, and rear projection beam.
- **5 Seating Categories**:
  - **Silver** (₹150): Front rows A & B
  - **Gold** (₹220): Mid stadium rows C, D, E
  - **Platinum** (₹300): Central THX sweet spot rows F, G, H (e.g., Seat G8)
  - **Recliner** (₹450): Motorized luxury recliners row J
  - **VIP** (₹600): Private lounge suite row K
- **Live Movie Trailer on 3D Screen**: Real HTML5 video mapped directly onto the 3D cinema screen mesh via Three.js `VideoTexture` with dynamic ambient auditorium glow, play/pause, volume controls, and scrubber.

### 2. Exact Seat-Based Camera Flight & Preview
- Clicking any seat retrieves its actual `(coordX, coordY, coordZ)` 3D coordinates.
- Smoothly animates the camera using linear interpolation to the exact seated eye position `(seat.x, seat.y + 0.82m, seat.z + 0.05m)` oriented directly toward the center of the giant screen `(0, 4.2m, -10.0m)`.
- Seamless toggle: **"Return to 3D Explore Mode"** smoothly resets the view back to orbit controls.
- **2D Map Fallback**: Accessible 2D seating chart available at any time with a single click.

### 3. Real-Time 3D Geometric Seat Comparison
- Side-by-side comparison of multiple seats (e.g., G8 vs H10 vs D4).
- Real-time trigonometric calculations:
  - **Distance to Screen Center**: $d = \sqrt{x^2 + (y_{eye} - y_{screen})^2 + (z - z_{screen})^2}$
  - **Horizontal Offset Angle**: $\theta_H = \arctan2(|x|, |z - z_{screen}|) \times \frac{180^\circ}{\pi}$
  - **Vertical Viewing Pitch**: $\theta_V = \arctan2(|y_{eye} - y_{screen}|, |z - z_{screen}|) \times \frac{180^\circ}{\pi}$
  - Automatic **THX Sweet Spot** identification for central reference positions.

### 4. Real-Time Seat Locking & Booking Engine
- Backend atomic database transactions (`Prisma + SQLite / PostgreSQL`).
- **5-Minute Temporary Seat Lock**: Automatic countdown timer on the frontend and scheduled background cleanup worker on the backend.
- Prevents double booking and race conditions.

### 5. Razorpay Verified Payment & Digital QR Pass
- Server-side Razorpay order creation (`/api/payments/create-order`) and cryptographic HMAC SHA256 signature verification (`/api/payments/verify`).
- Verified payment automatically marks show seats as `BOOKED` and generates a `Ticket` with a signed QR code payload.
- Confetti celebration, printable / downloadable PDF pass, and `/api/bookings/verify-qr/:ticketCode` turnstile scanner verification.

### 6. Admin Command & Analytics Dashboard
- **Revenue Analytics**: Total revenue, verified bookings, auditorium occupancy rate, and category economics.
- **Movie Catalog Manager**: Add, edit, delete movies, posters, and trailer streams.
- **Showtime Scheduler**: Schedule shows with custom pricing multipliers and automatic 3D seat population.
- **Bookings Management**: Search bookings, inspect customer receipts, and trigger cancellations.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on Node v22.18.0)
- npm v9+

### Directory Structure
```
cineverse-3d/
├── client/                     # Vite + React 18 + TypeScript + Three.js + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── cinema3d/       # CinemaCanvas, Screen, Auditorium, Seats, CameraController
│   │   │   ├── booking/        # BookingSidebar, CheckoutModal
│   │   │   ├── movies/         # MovieCard
│   │   │   └── layout/         # Navbar, AuthModal
│   │   ├── context/            # AuthContext, BookingContext
│   │   ├── pages/              # Home, Movies, MovieDetails, 3D Auditorium, Ticket, MyBookings, Admin
│   │   └── services/           # api.ts (REST client & session management)
├── server/                     # Node.js + Express + TypeScript + Prisma
│   ├── prisma/
│   │   ├── schema.prisma       # Full relational schema (User, Movie, Show, Seat, Booking, Payment, Ticket)
│   │   └── dev.db              # SQLite database (can switch to Postgres via .env)
│   └── src/
│       ├── routes/             # auth, movies, cinemas, shows, locks, bookings, payments, admin
│       ├── middleware/         # JWT auth & admin guard
│       ├── seed.ts             # Seed script (280 physical 3D seats, 5 movies, 24 shows)
│       └── index.ts            # Server entrypoint with lock cleanup engine
```

### Running Locally

1. **Start Backend Server**:
   ```bash
   cd server
   npm install
   npx prisma db push
   npm run seed
   npm run dev
   ```
   *Runs on `http://localhost:5000`*

2. **Start Frontend Client**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:5173`*

---

## 🔑 Demo Credentials

| Role | Email | Password | Features Accessible |
|---|---|---|---|
| **Demo Customer** | `user@cineverse.com` | `password123` | 3D theatre preview, seat locking, checkout, digital passes |
| **Cinema Director / Admin** | `admin@cineverse.com` | `admin123` | Full admin analytics, movie CRUD, show scheduler, cancellations |

*(A quick one-click autofill button is available on the Sign In modal).*

---

## 💳 Razorpay Test Mode

- Razorpay Key ID: `rzp_test_cineverse12345`
- Razorpay Key Secret: `cineverse_secret_key_razorpay_test`
- Supported Modes:
  1. Live test modal via `checkout.razorpay.com`
  2. Cryptographically signed direct test verification endpoint on the backend
