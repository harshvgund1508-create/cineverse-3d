import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Movie } from '../types';
import { MovieCard } from '../components/movies/MovieCard';
import {
  Sparkles,
  Box,
  Eye,
  Film,
  Play,
  Search,
  Star,
  MapPin,
  Clock,
  Compass,
  X,
  ChevronRight,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  // Quick trailer modal
  const [trailerModalMovie, setTrailerModalMovie] = useState<Movie | null>(null);

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        const res = await api.movies.getAll();
        setMovies(res.movies);
        const featured = res.movies.find((m) => m.isFeatured) || res.movies[0];
        setFeaturedMovie(featured);
      } catch (err) {
        console.error('Failed to load movies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, []);

  const genres = ['All', 'Sci-Fi', 'Action', 'Fantasy', 'Cyberpunk'];

  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || m.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-cine-dark text-slate-100 flex flex-col">
      {/* 1. CINEMATIC HERO SECTION */}
      {featuredMovie && (
        <section className="relative w-full h-[85vh] min-h-[580px] flex items-end pb-16 px-4 sm:px-8 overflow-hidden">
          {/* Backdrop Image with Multi-Gradient Dimming */}
          <div className="absolute inset-0">
            <img
              src={featuredMovie.backdropUrl}
              alt={featuredMovie.title}
              className="w-full h-full object-cover object-center scale-105 animate-pulse-slow"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cine-dark via-cine-dark/70 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-cine-dark via-cine-dark/80 to-transparent" />
          </div>

          <div className="relative max-w-7xl mx-auto w-full z-10 flex flex-col items-start gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-cine-cyan/20 border border-cine-cyan/50 text-cine-cyan text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-glow-cyan">
                <Sparkles className="w-3.5 h-3.5" />
                Featured IMAX 3D Release
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-semibold">
                {featuredMovie.ageRating}
              </span>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{featuredMovie.rating.toFixed(1)}/10</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight font-display max-w-3xl leading-none">
              {featuredMovie.title}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl line-clamp-2 sm:line-clamp-3 leading-relaxed">
              {featuredMovie.synopsis}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-4 h-4 text-cine-cyan" />
                {featuredMovie.duration} mins
              </span>
              <span>•</span>
              <span className="text-slate-300">{featuredMovie.genre}</span>
              <span>•</span>
              <span className="text-slate-300">{featuredMovie.language}</span>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 mt-4">
              <Link
                to={`/movies/${featuredMovie.id}`}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cine-cyan via-cine-blue to-cine-violet text-black font-extrabold text-sm flex items-center gap-2 hover:opacity-95 shadow-glow-cyan transition-all transform hover:-translate-y-0.5"
              >
                <Box className="w-4 h-4 fill-current" />
                <span>Experience in 3D & Book</span>
              </Link>

              <button
                onClick={() => setTrailerModalMovie(featuredMovie)}
                className="px-6 py-4 rounded-2xl glass-panel text-white hover:bg-white/15 font-bold text-sm flex items-center gap-2 border border-white/10 transition-all"
              >
                <Play className="w-4 h-4 fill-current text-cine-cyan" />
                <span>Watch Trailer</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. HOW 3D SEAT PREVIEW WORKS (THE SIGNATURE EXPERIENCE) */}
      <section className="py-16 px-4 sm:px-8 border-y border-white/5 bg-gradient-to-b from-transparent via-[#090D1C]/60 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="px-3.5 py-1 rounded-full bg-cine-violet/20 border border-cine-violet/40 text-cine-violet text-xs font-bold uppercase tracking-wider">
              Signature Technology
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display mt-3">
              Don't Just Book Your Seat. Experience Your View.
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              CineVerse 3D places you right inside the virtual auditorium. Watch real trailers on the giant screen from any seat before purchasing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-3xl p-6 border border-white/10 relative hover:border-cine-cyan/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-cine-cyan/15 text-cine-cyan flex items-center justify-center font-bold text-lg mb-4 border border-cine-cyan/30">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display mb-1.5">
                1. Step Into Virtual Cinema
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter an architecturally modeled 3D theatre featuring tiered stadium risers, Dolby acoustic baffles, and a live giant projection screen.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-white/10 relative hover:border-cine-violet/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-cine-violet/15 text-cine-violet flex items-center justify-center font-bold text-lg mb-4 border border-cine-violet/30">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display mb-1.5">
                2. Click Any Seat (e.g. G8)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The 3D camera glides smoothly to your exact selected seat's eye-level elevation and rotates straight toward the center of the screen.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-white/10 relative hover:border-amber-500/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-lg mb-4 border border-amber-500/30">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display mb-1.5">
                3. Compare Geometric Angles
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verify distance in meters, horizontal offset degrees, and vertical viewing pitch calculated from 3D coordinates before locking tickets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NOW SHOWING MOVIES CATALOG WITH SEARCH & FILTERS */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-cine-cyan text-xs font-bold uppercase tracking-wider mb-1">
              <Film className="w-4 h-4" />
              <span>Cinema Schedule</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white font-display">
              Now Showing in 3D
            </h2>
          </div>

          {/* Search & Genre Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search movies, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cine-cyan"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedGenre === g
                      ? 'bg-cine-cyan text-black font-bold'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Movie Cards Grid */}
        {loading ? (
          <div className="py-20 flex justify-center text-cine-cyan">
            <div className="w-10 h-10 border-4 border-cine-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="p-12 text-center text-slate-400 glass-panel rounded-3xl border border-white/10">
            <p>No movies found matching "{searchQuery}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onWatchTrailer={(m) => setTrailerModalMovie(m)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. POPULAR CINEMA VENUES SPOTLIGHT */}
      <section className="py-16 px-4 sm:px-8 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs text-cine-cyan font-bold uppercase tracking-wider">
                Flagship Locations
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
                Luxury 3D Theatres
              </h2>
            </div>
            <Link
              to="/cinemas"
              className="text-xs font-bold text-cine-cyan hover:underline flex items-center gap-1"
            >
              <span>View All Venues</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-3xl overflow-hidden border border-white/10 group">
              <div className="h-48 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop"
                  alt="CineVerse Grand IMAX Mumbai"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cine-dark via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-cine-cyan border border-cine-cyan/40">
                  IMAX LASER 3D
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white font-display">
                  CineVerse Grand IMAX & 4DX
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-cine-cyan" />
                  Phoenix Palladium, Lower Parel, Mumbai
                </p>
                <div className="flex flex-wrap gap-2 mt-4 text-[11px] text-slate-300">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                    140 Stadium Seats
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                    Dolby Atmos 128ch
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                    VIP Lounge
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden border border-white/10 group">
              <div className="h-48 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop"
                  alt="CineVerse Luxe Dolby Cinema Bengaluru"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cine-dark via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-cine-violet border border-cine-violet/40">
                  DOLBY VISION 4K
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white font-display">
                  CineVerse Luxe Dolby Cinema
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-cine-violet" />
                  Nexus Koramangala Mall, Bengaluru
                </p>
                <div className="flex flex-wrap gap-2 mt-4 text-[11px] text-slate-300">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                    Dual Laser HDR
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                    Motorized Recliners
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                    Valet Parking
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRAILER VIDEO POPUP MODAL */}
      {trailerModalMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="glass-panel w-full max-w-4xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
            <button
              onClick={() => setTrailerModalMovie(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white font-display">
                {trailerModalMovie.title} — Official Trailer
              </h3>
            </div>
            <div className="aspect-video w-full bg-black">
              <video
                src={trailerModalMovie.trailerUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-auto py-12 px-4 sm:px-8 border-t border-white/10 bg-black text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cine-cyan text-black flex items-center justify-center font-bold text-xs">
              3D
            </div>
            <span className="text-white font-bold tracking-wider font-display">CINEVERSE 3D</span>
          </div>
          <p>© 2026 CineVerse 3D. Don't Just Book Your Seat. Experience Your View.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
