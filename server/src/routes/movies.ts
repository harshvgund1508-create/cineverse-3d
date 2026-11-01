import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET all movies with search & filters
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { search, genre, language, featured, trending, nowShowing } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { genre: { contains: String(search) } },
        { director: { contains: String(search) } },
        { cast: { contains: String(search) } },
      ];
    }
    if (genre && genre !== 'All') {
      where.genre = { contains: String(genre) };
    }
    if (language && language !== 'All') {
      where.language = { contains: String(language) };
    }
    if (featured === 'true') {
      where.isFeatured = true;
    }
    if (trending === 'true') {
      where.isTrending = true;
    }
    if (nowShowing === 'true') {
      where.isNowShowing = true;
    }

    const movies = await prisma.movie.findMany({
      where,
      orderBy: { rating: 'desc' },
      include: {
        _count: {
          select: { shows: true, reviews: true },
        },
      },
    });

    return res.json({ movies });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET single movie details with upcoming shows, auditoriums, cinemas, reviews
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        shows: {
          include: {
            auditorium: {
              include: { cinema: true },
            },
          },
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    return res.json({ movie });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Add Movie
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const {
      title,
      synopsis,
      posterUrl,
      backdropUrl,
      trailerUrl,
      duration,
      genre,
      language,
      rating,
      releaseDate,
      ageRating,
      director,
      cast,
      isFeatured,
      isTrending,
      isNowShowing,
    } = req.body;

    if (!title || !synopsis || !posterUrl || !trailerUrl) {
      return res.status(400).json({ error: 'Missing mandatory movie fields.' });
    }

    const movie = await prisma.movie.create({
      data: {
        title,
        synopsis,
        posterUrl,
        backdropUrl: backdropUrl || posterUrl,
        trailerUrl,
        duration: Number(duration) || 120,
        genre: genre || 'Action, Sci-Fi',
        language: language || 'English',
        rating: Number(rating) || 8.5,
        releaseDate: releaseDate || new Date().toISOString().split('T')[0],
        ageRating: ageRating || 'UA',
        director: director || 'Director Name',
        cast: cast || 'Lead Actor, Supporting Actor',
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        isNowShowing: isNowShowing !== undefined ? Boolean(isNowShowing) : true,
      },
    });

    return res.status(201).json({ movie });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Update Movie
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.update({
      where: { id },
      data: req.body,
    });
    return res.json({ movie });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Delete Movie
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await prisma.movie.delete({ where: { id } });
    return res.json({ message: 'Movie deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
