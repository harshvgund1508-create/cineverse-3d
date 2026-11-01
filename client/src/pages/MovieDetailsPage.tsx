import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Movie } from '../types';
import {
  Star,
  Clock,
  Calendar,
  Box,
  Play,
  MapPin,
  Film,
  Sparkles,
  ArrowRight,
  User as UserIcon,
  X,
  Volume2,
} from 'lucide-react';

export const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Show selection state
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>('all');
  const [showTrailerModal, setShowTrailerModal] = useState<boolean>(false);

  useEffect(() => {
    async function loadMovie() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await api.movies.getById(id);
        setMovie(res.movie);
        if (res.movie.shows && res.movie.shows.length > 0) {
          // Set initial date from first available show
          setSelectedDate(res.movie.shows[0].date);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load movie details');
      } finally {
        setLoading(false);
      }
    }
    loadMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cine-dark">
        <div className="flex flex-col items-center gap-3 text-cine-cyan">
          <div className="w-12 h-12 border-4 border-cine-cyan border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wide">Loading Cinematic Experience...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-cine-dark text-center">
        <div className="glass-panel p-8 rounded-3xl max-w-md border border-rose-500/30">
          <p className="text-rose-400 font-bold mb-2">Movie Not Found</p>
          <p className="text-sm text-slate-300">{error || 'The requested title is not available.'}</p>
          <Link
            to="/movies"
            className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
          >
            Return to Movies
          </Link>
        </div>
      </div>
    );
  }

  // Extract unique dates from movie.shows
  const dates: string[] = Array.from(new Set(movie.shows?.map((s) => s.date) || [])).sort();

  // Extract unique cinemas
  const cinemasMap = new Map<string, any>();
  movie.shows?.forEach((s) => {
    if (s.auditorium?.cinema) {
      cinemasMap.set(s.auditorium.cinema.id, s.auditorium.cinema);
    }
  });
  const cinemas = Array.from(cinemasMap.values());

  // Filter shows by selected date & cinema
  const availableShows =
    movie.shows?.filter((s) => {
      const matchDate = !selectedDate || s.date === selectedDate;
      const matchCinema =
        selectedCinemaId === 'all' || s.auditorium.cinemaId === selectedCinemaId;
      return matchDate && matchCinema;
    }) || [];

  return (
    <div className="min-h-screen bg-cine-dark text-slate-100 flex flex-col pb-20">
      {/* 1. Backdrop Header Banner */}
      <div className="relative w-full h-[55vh] min-h-[420px] overflow-hidden">
        <img
          src={movie.backdropUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cine-dark via-cine-dark/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cine-dark via-cine-dark/60 to-transparent" />

        {/* Back Button */}
        <Link
          to="/"
          className="absolute top-20 left-4 sm:left-8 px-4 py-2 rounded-xl glass-panel text-xs text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors"
        >
          <span>← Back to Catalog</span>
        </Link>
      </div>

      {/* 2. Main Movie Profile & Synopsis */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-10 w-full">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Poster */}
          <div className="w-48 sm:w-64 shrink-0 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-auto object-cover" />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-cine-cyan/20 border border-cine-cyan/40 text-cine-cyan text-xs font-bold uppercase font-mono">
                {movie.ageRating}
              </span>
              <span className="px-3 py-0.5 rounded-full bg-white/10 text-slate-200 text-xs font-semibold">
                {movie.language}
              </span>
              <div className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{movie.rating.toFixed(1)}/10</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-4 h-4 text-cine-cyan" />
                {movie.duration} minutes
              </span>
              <span>•</span>
              <span className="text-slate-300">{movie.genre}</span>
              <span>•</span>
              <span>Released {movie.releaseDate}</span>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
              {movie.synopsis}
            </p>

            {/* Director & Cast */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 uppercase text-[10px] block">Director</span>
                <span className="font-semibold text-white">{movie.director}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px] block">Starring Cast</span>
                <span className="font-semibold text-white">{movie.cast}</span>
              </div>
            </div>

            <button
              onClick={() => setShowTrailerModal(true)}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel text-white hover:bg-white/20 border border-white/15 text-xs font-bold transition-all"
            >
              <Play className="w-4 h-4 fill-current text-cine-cyan" />
              <span>Watch Official Trailer</span>
            </button>
          </div>
        </div>

        {/* 3. SHOWTIME SCHEDULER & 3D ENTRY */}
        <div className="mt-14 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-cine-cyan text-xs font-bold uppercase tracking-wider">
                <Box className="w-4 h-4" />
                <span>Select Showtime & Enter 3D Theatre</span>
              </div>
              <h2 className="text-2xl font-bold text-white font-display mt-1">
                Auditorium Schedule
              </h2>
            </div>

            {/* Cinema Filter Dropdown */}
            {cinemas.length > 1 && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedCinemaId}
                  onChange={(e) => setSelectedCinemaId(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cine-cyan"
                >
                  <option value="all">All Cinemas</option>
                  {cinemas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date Picker Pills */}
          <div className="py-6 flex items-center gap-2 overflow-x-auto">
            {dates.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDate === d
                    ? 'bg-cine-cyan text-black font-extrabold shadow-glow-cyan'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                {d === new Date().toISOString().split('T')[0] ? 'Today • ' : ''}
                {d}
              </button>
            ))}
          </div>

          {/* Show Cards Grid */}
          {availableShows.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No shows available for the selected date and cinema.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {availableShows.map((s) => (
                <div
                  key={s.id}
                  className="glass-card rounded-2xl p-5 border border-white/10 hover:border-cine-cyan/50 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-cine-cyan px-2.5 py-0.5 rounded-md bg-cine-cyan/15 border border-cine-cyan/30">
                        {s.auditorium.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {s.auditorium.cinema?.city}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 line-clamp-1 mb-3">
                      {s.auditorium.cinema?.name}
                    </div>

                    <div className="flex items-center justify-between py-2 border-t border-b border-white/5 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Showtime</span>
                        <span className="text-lg font-mono font-bold text-white">
                          {s.startTime}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block">Sound</span>
                        <span className="text-xs font-semibold text-slate-200">
                          {s.auditorium.soundSystem}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/auditorium/${s.id}`)}
                    className="mt-4 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cine-cyan to-cine-blue group-hover:from-cine-cyan group-hover:to-cine-violet text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-glow-cyan"
                  >
                    <Box className="w-4 h-4 fill-current" />
                    <span>Enter 3D Cinema</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Audience Reviews Section */}
        {movie.reviews && movie.reviews.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-white font-display mb-4">
              Audience 3D Reviews
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {movie.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="glass-card rounded-2xl p-4 border border-white/5 text-xs text-slate-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-cine-cyan" />
                      {rev.user.name}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{rev.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-slate-400 italic leading-relaxed">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {showTrailerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="glass-panel w-full max-w-4xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
            <button
              onClick={() => setShowTrailerModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full bg-black">
              <video
                src={movie.trailerUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
