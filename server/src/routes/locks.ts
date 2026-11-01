import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Lock seats for a show (Atomic transactional lock)
router.post('/:showId/lock', optionalAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { showId } = req.params;
    const { seatIds, sessionId } = req.body;

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ error: 'Seat IDs array is required.' });
    }
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required.' });
    }

    const userId = req.user?.id || null;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + LOCK_DURATION_MS);

    // Atomic transaction using Prisma
    const result = await prisma.$transaction(async (tx) => {
      // 1. Purge expired locks first
      await tx.seatLock.deleteMany({
        where: {
          showId,
          expiresAt: { lt: now },
        },
      });

      // 2. Check if any requested seats are already BOOKED
      const bookedSeats = await tx.showSeat.findMany({
        where: {
          showId,
          seatId: { in: seatIds },
          status: 'BOOKED',
        },
        include: { seat: true },
      });

      if (bookedSeats.length > 0) {
        const numbers = bookedSeats.map((b) => b.seat.seatNumber).join(', ');
        throw new Error(`Seats already booked: ${numbers}`);
      }

      // 3. Check if any requested seats are currently LOCKED by ANOTHER session
      const conflictingLocks = await tx.seatLock.findMany({
        where: {
          showId,
          seatId: { in: seatIds },
          sessionId: { not: sessionId },
          expiresAt: { gte: now },
        },
        include: { seat: true },
      });

      if (conflictingLocks.length > 0) {
        const numbers = conflictingLocks.map((l) => l.seat.seatNumber).join(', ');
        throw new Error(`Seats temporarily locked by another customer: ${numbers}`);
      }

      // 4. Release any existing locks from THIS session for other seats not in the current selection
      await tx.seatLock.deleteMany({
        where: {
          showId,
          sessionId,
          seatId: { notIn: seatIds },
        },
      });

      // 5. Create or extend lock for each seat
      for (const seatId of seatIds) {
        await tx.seatLock.upsert({
          where: {
            showId_seatId: {
              showId,
              seatId,
            },
          },
          update: {
            sessionId,
            userId,
            expiresAt,
          },
          create: {
            showId,
            seatId,
            sessionId,
            userId,
            expiresAt,
          },
        });
      }

      return {
        success: true,
        lockedSeatIds: seatIds,
        expiresAt: expiresAt.toISOString(),
        expiresInSeconds: 300,
      };
    });

    return res.json(result);
  } catch (error: any) {
    return res.status(409).json({ error: error.message || 'Seat lock conflict' });
  }
});

// Unlock seats (e.g. user cancels or navigates away)
router.post('/:showId/unlock', optionalAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { showId } = req.params;
    const { seatIds, sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required.' });
    }

    const where: any = { showId, sessionId };
    if (seatIds && Array.isArray(seatIds) && seatIds.length > 0) {
      where.seatId = { in: seatIds };
    }

    await prisma.seatLock.deleteMany({ where });

    return res.json({ success: true, message: 'Seats unlocked.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
