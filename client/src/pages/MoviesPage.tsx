import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Movie } from '../types';
import { MovieCard } from '../components/movies/MovieCard';
import { Film, Search, Sparkles } from 'lucide-react';

export const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        const res = await api.movies.getAll();
        setMovies(res.movies);
      } catch (err) {
        console.error('Failed to load movies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, []);

  const genres = ['All', 'Sci-Fi', 'Action', 'Fantasy', 'Cyberpunk', 'Space Epic'];

  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.cast.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || m.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-cine-dark flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-cine-cyan text-xs font-bold uppercase tracking-wider mb-1">
              <Film className="w-4 h-4" />
              <span>Full Schedule Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Explore 3D Cinema Releases
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Choose any title to enter its 3D auditorium and preview the view before booking.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search movies, directors..."
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

        {/* Catalog Grid */}
        {loading ? (
          <div className="py-20 flex justify-center text-cine-cyan">
            <div className="w-10 h-10 border-4 border-cine-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="p-12 text-center text-slate-400 glass-panel rounded-3xl border border-white/10">
            <p>No titles matched your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
