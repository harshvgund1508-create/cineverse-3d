import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET shows by movie or cinema or date
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { movieId, cinemaId, date } = req.query;

    const where: any = {};
    if (movieId) where.movieId = String(movieId);
    if (date) where.date = String(date);
    if (cinemaId) {
      where.auditorium = { cinemaId: String(cinemaId) };
    }

    const shows = await prisma.show.findMany({
      where,
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
            backdropUrl: true,
            trailerUrl: true,
            duration: true,
            genre: true,
            language: true,
            ageRating: true,
          },
        },
        auditorium: {
          include: {
            cinema: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    return res.json({ shows });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET show with complete 3D auditorium seating and real-time availability
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    // First purge expired locks
    await prisma.seatLock.deleteMany({
      where: {
        showId: id,
        expiresAt: { lt: new Date() },
      },
    });

    const show = await prisma.show.findUnique({
      where: { id },
      include: {
        movie: true,
        auditorium: {
          include: {
            cinema: true,
            seats: {
              include: { category: true },
            },
          },
        },
        showSeats: true,
        seatLocks: true,
      },
    });

    if (!show) {
      return res.status(404).json({ error: 'Show not found.' });
    }

    // Build map of seat status
    const bookedSeatIds = new Set(
      show.showSeats
        .filter((ss) => ss.status === 'BOOKED')
        .map((ss) => ss.seatId)
    );

    const lockedSeatMap = new Map<string, { sessionId: string; expiresAt: Date }>();
    show.seatLocks.forEach((lock) => {
      lockedSeatMap.set(lock.seatId, {
        sessionId: lock.sessionId,
        expiresAt: lock.expiresAt,
      });
    });

    const priceMap = new Map<string, number>();
    show.showSeats.forEach((ss) => {
      priceMap.set(ss.seatId, ss.price);
    });

    // Merge seats with real-time status and 3D coordinates
    const seats = show.auditorium.seats.map((s) => {
      let status: 'AVAILABLE' | 'LOCKED' | 'BOOKED' = 'AVAILABLE';
      let lockInfo: any = null;

      if (bookedSeatIds.has(s.id)) {
        status = 'BOOKED';
      } else if (lockedSeatMap.has(s.id)) {
        status = 'LOCKED';
        lockInfo = lockedSeatMap.get(s.id);
      }

      const calculatedPrice =
        priceMap.get(s.id) ||
        Math.round(s.category.basePrice * show.basePriceMultiplier);

      return {
        id: s.id,
        seatNumber: s.seatNumber,
        row: s.row,
        col: s.col,
        categoryId: s.categoryId,
        category: s.category,
        coordX: s.coordX,
        coordY: s.coordY,
        coordZ: s.coordZ,
        status,
        price: calculatedPrice,
        lockInfo,
      };
    });

    return res.json({
      show: {
        id: show.id,
        date: show.date,
        startTime: show.startTime,
        endTime: show.endTime,
        basePriceMultiplier: show.basePriceMultiplier,
        movie: show.movie,
        auditorium: {
          id: show.auditorium.id,
          name: show.auditorium.name,
          screenType: show.auditorium.screenType,
          soundSystem: show.auditorium.soundSystem,
          cinema: show.auditorium.cinema,
        },
      },
      seats,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Schedule a show
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { movieId, auditoriumId, date, startTime, endTime, basePriceMultiplier } = req.body;

    if (!movieId || !auditoriumId || !date || !startTime) {
      return res.status(400).json({ error: 'Missing required show schedule fields.' });
    }

    const show = await prisma.show.create({
      data: {
        movieId,
        auditoriumId,
        date,
        startTime,
        endTime: endTime || '11:00 PM',
        basePriceMultiplier: Number(basePriceMultiplier) || 1.0,
      },
    });

    // Populate showSeats
    const audiSeats = await prisma.seat.findMany({
      where: { auditoriumId },
      include: { category: true },
    });

    const showSeatsData = audiSeats.map((s) => ({
      showId: show.id,
      seatId: s.id,
      status: 'AVAILABLE',
      price: Math.round(s.category.basePrice * (Number(basePriceMultiplier) || 1.0)),
    }));

    await prisma.showSeat.createMany({
      data: showSeatsData,
    });

    return res.status(201).json({ show });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
