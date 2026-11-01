import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireAdmin);

// 1. Analytics Overview
router.get('/analytics', async (_req: AuthRequest, res: Response): Promise<any> => {
  try {
    const totalBookings = await prisma.booking.count({
      where: { status: 'CONFIRMED' },
    });

    const totalRevenueData = await prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    });
    const totalRevenue = totalRevenueData._sum.amount || 0;

    const totalMovies = await prisma.movie.count();
    const totalShows = await prisma.show.count();
    const totalSeats = await prisma.seat.count();
    const totalBookedSeats = await prisma.showSeat.count({
      where: { status: 'BOOKED' },
    });

    const occupancyRate = totalSeats > 0 ? ((totalBookedSeats / (totalSeats * 2)) * 100).toFixed(1) : '0';

    // Popular Movies
    const movies = await prisma.movie.findMany({
      include: {
        shows: {
          include: {
            bookings: {
              where: { status: 'CONFIRMED' },
              select: { totalAmount: true },
            },
          },
        },
      },
    });

    const movieStats = movies.map((m) => {
      let revenue = 0;
      let bookingsCount = 0;
      m.shows.forEach((s) => {
        bookingsCount += s.bookings.length;
        s.bookings.forEach((b) => {
          revenue += b.totalAmount;
        });
      });
      return {
        id: m.id,
        title: m.title,
        genre: m.genre,
        rating: m.rating,
        posterUrl: m.posterUrl,
        bookingsCount,
        revenue,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Seat Category Statistics
    const categories = await prisma.seatCategory.findMany({
      include: {
        seats: {
          include: {
            bookingSeats: {
              where: {
                booking: { status: 'CONFIRMED' },
              },
            },
          },
        },
      },
    });

    const categoryStats = categories.map((cat) => {
      let soldCount = 0;
      let revenue = 0;
      cat.seats.forEach((seat) => {
        soldCount += seat.bookingSeats.length;
        seat.bookingSeats.forEach((bs) => {
          revenue += bs.price;
        });
      });
      return {
        id: cat.id,
        name: cat.name,
        basePrice: cat.basePrice,
        color: cat.color,
        soldCount,
        revenue,
      };
    });

    // Recent Bookings
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        show: {
          include: {
            movie: { select: { title: true } },
            auditorium: { select: { name: true } },
          },
        },
        payment: true,
      },
    });

    return res.json({
      metrics: {
        totalBookings,
        totalRevenue,
        totalMovies,
        totalShows,
        occupancyRate: `${occupancyRate}%`,
      },
      movieStats,
      categoryStats,
      recentBookings,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. All Bookings with Filter & Search
router.get('/bookings', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { status, search } = req.query;
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = String(status);
    }
    if (search) {
      where.OR = [
        { bookingRef: { contains: String(search) } },
        { user: { name: { contains: String(search) } } },
        { user: { email: { contains: String(search) } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        show: {
          include: {
            movie: true,
            auditorium: { include: { cinema: true } },
          },
        },
        bookingSeats: {
          include: {
            seat: { include: { category: true } },
          },
        },
        payment: true,
        ticket: true,
      },
    });

    return res.json({ bookings });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. Update Seat Category Pricing
router.put('/categories/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { basePrice, color, description } = req.body;

    const updated = await prisma.seatCategory.update({
      where: { id },
      data: {
        ...(basePrice !== undefined && { basePrice: Number(basePrice) }),
        ...(color && { color }),
        ...(description && { description }),
      },
    });

    return res.json({ category: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. Cancel a booking and process refund status
router.post('/bookings/:id/cancel', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { bookingSeats: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      // Free showSeats back to AVAILABLE
      for (const bs of booking.bookingSeats) {
        await tx.showSeat.updateMany({
          where: {
            showId: booking.showId,
            seatId: bs.seatId,
          },
          data: { status: 'AVAILABLE' },
        });
      }
    });

    return res.json({ success: true, message: 'Booking cancelled and seats released.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
