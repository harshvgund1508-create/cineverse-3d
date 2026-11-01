import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Create booking draft from locked seats
router.post('/create', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { showId, seatIds, sessionId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User must be authenticated to create a booking.' });
    }
    if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ error: 'showId and an array of seatIds are required.' });
    }

    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        movie: true,
        auditorium: { include: { cinema: true } },
      },
    });

    if (!show) {
      return res.status(404).json({ error: 'Show not found.' });
    }

    // Verify seats are actually locked by this user/session and not expired
    const now = new Date();
    const locks = await prisma.seatLock.findMany({
      where: {
        showId,
        seatId: { in: seatIds },
        expiresAt: { gte: now },
        OR: [
          { userId },
          { sessionId: sessionId || '' },
        ],
      },
      include: {
        seat: { include: { category: true } },
      },
    });

    if (locks.length !== seatIds.length) {
      return res.status(400).json({
        error: 'One or more selected seats are not locked by your session or the lock has expired. Please re-select seats.',
      });
    }

    // Calculate itemized pricing
    const convenienceFeePerTicket = 35;
    let baseTotal = 0;
    const seatsPricing = locks.map((l) => {
      const price = Math.round(l.seat.category.basePrice * show.basePriceMultiplier);
      baseTotal += price;
      return {
        seatId: l.seatId,
        seatNumber: l.seat.seatNumber,
        category: l.seat.category.name,
        price,
      };
    });

    const totalConvenienceFee = convenienceFeePerTicket * seatIds.length;
    const taxes = Math.round((baseTotal + totalConvenienceFee) * 0.18); // 18% GST
    const finalTotal = baseTotal + totalConvenienceFee + taxes;

    // Generate unique booking reference e.g. "CV-2026-X81A"
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingRef = `CV-${new Date().getFullYear()}-${randomSuffix}`;

    const booking = await prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          bookingRef,
          userId,
          showId,
          totalAmount: finalTotal,
          status: 'PENDING',
        },
      });

      for (const sp of seatsPricing) {
        await tx.bookingSeat.create({
          data: {
            bookingId: createdBooking.id,
            seatId: sp.seatId,
            price: sp.price,
          },
        });
      }

      return createdBooking;
    });

    return res.status(201).json({
      booking: {
        id: booking.id,
        bookingRef: booking.bookingRef,
        totalAmount: booking.totalAmount,
        status: booking.status,
        baseTotal,
        convenienceFee: totalConvenienceFee,
        taxes,
        seats: seatsPricing,
        show: {
          date: show.date,
          startTime: show.startTime,
          movie: show.movie.title,
          cinema: show.auditorium.cinema.name,
          auditorium: show.auditorium.name,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Get current user's booking history
router.get('/my', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        show: {
          include: {
            movie: true,
            auditorium: {
              include: { cinema: true },
            },
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

// Get single booking by ID or Reference
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id }, { bookingRef: id }],
      },
      include: {
        show: {
          include: {
            movie: true,
            auditorium: {
              include: { cinema: true },
            },
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

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Only allow owner or admin
    if (booking.userId !== req.user?.id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to view this booking.' });
    }

    return res.json({ booking });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Verify digital QR code ticket (for cinema staff scanning or verification modal)
router.get('/verify-qr/:ticketCode', async (req, res): Promise<any> => {
  try {
    const { ticketCode } = req.params;
    const ticket = await prisma.ticket.findUnique({
      where: { ticketCode },
      include: {
        booking: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
            show: {
              include: {
                movie: true,
                auditorium: {
                  include: { cinema: true },
                },
              },
            },
            bookingSeats: {
              include: { seat: true },
            },
            payment: true,
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({
        valid: false,
        message: 'Invalid or counterfeit QR ticket. Code does not exist in CineVerse registry.',
      });
    }

    return res.json({
      valid: true,
      ticketCode: ticket.ticketCode,
      bookingRef: ticket.booking.bookingRef,
      status: ticket.booking.status,
      customerName: ticket.booking.user.name,
      movie: ticket.booking.show.movie.title,
      cinema: ticket.booking.show.auditorium.cinema.name,
      auditorium: ticket.booking.show.auditorium.name,
      date: ticket.booking.show.date,
      time: ticket.booking.show.startTime,
      seats: ticket.booking.bookingSeats.map((b) => b.seat.seatNumber),
      paymentMethod: ticket.booking.payment?.method || 'Verified Online Payment',
      amount: ticket.booking.totalAmount,
      generatedAt: ticket.generatedAt,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
