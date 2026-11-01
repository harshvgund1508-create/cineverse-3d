import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import movieRoutes from './routes/movies';
import cinemaRoutes from './routes/cinemas';
import showRoutes from './routes/shows';
import lockRoutes from './routes/locks';
import bookingRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';
import { prisma } from './prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for client
app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/shows', lockRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'CineVerse 3D Engine API',
    time: new Date().toISOString(),
  });
});

// Real-time lock cleanup worker (runs every 30 seconds)
setInterval(async () => {
  try {
    const deleted = await prisma.seatLock.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    if (deleted.count > 0) {
      console.log(`[Lock Engine] Released ${deleted.count} expired seat locks.`);
    }
  } catch (err: any) {
    console.error('[Lock Engine] Error clearing expired locks:', err.message);
  }
}, 30000);

app.listen(PORT, () => {
  console.log(`🎬 CineVerse 3D Server listening on http://localhost:${PORT}`);
});
