import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<any> => {
  try {
    const cinemas = await prisma.cinema.findMany({
      include: {
        auditoriums: {
          select: {
            id: true,
            name: true,
            screenType: true,
            soundSystem: true,
            totalRows: true,
            totalCols: true,
          },
        },
      },
    });
    return res.json({ cinemas });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const cinema = await prisma.cinema.findUnique({
      where: { id },
      include: {
        auditoriums: {
          include: {
            seats: {
              include: { category: true },
            },
          },
        },
      },
    });

    if (!cinema) {
      return res.status(404).json({ error: 'Cinema not found.' });
    }

    return res.json({ cinema });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
