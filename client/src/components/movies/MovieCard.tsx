import React from 'react';
import { Link } from 'react-router-dom';
import { Movie } from '../../types';
import { Star, Clock, Box, Play, ChevronRight } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onWatchTrailer?: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onWatchTrailer }) => {
  return (
    <div className="group glass-card rounded-3xl overflow-hidden border border-white/10 hover:border-cine-cyan/50 transition-all duration-300 hover:shadow-glow-cyan flex flex-col justify-between">
      {/* Poster with Overlays */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-cine-cyan flex items-center gap-1">
            <Box className="w-3 h-3" />
            3D PREVIEW
          </span>
          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-white">
            {movie.ageRating}
          </span>
        </div>

        {/* Rating Pill */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1 shadow-lg">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{movie.rating.toFixed(1)}</span>
        </div>

        {/* Quick Trailer Trigger Button on Hover */}
        {onWatchTrailer && (
          <button
            onClick={() => onWatchTrailer(movie)}
            className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-cine-cyan/90 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-glow-cyan hover:scale-110"
            title="Watch Trailer"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
        )}
      </div>

      {/* Info Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {movie.duration} mins
            </span>
            <span>•</span>
            <span className="line-clamp-1">{movie.language}</span>
          </div>

          <h3 className="text-lg font-bold text-white font-display group-hover:text-cine-cyan transition-colors line-clamp-1">
            {movie.title}
          </h3>

          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            {movie.genre}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center gap-2">
          <Link
            to={`/movies/${movie.id}`}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cine-cyan/20 to-cine-blue/20 hover:from-cine-cyan hover:to-cine-blue text-cine-cyan hover:text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-cine-cyan/30"
          >
            <Box className="w-3.5 h-3.5" />
            <span>Experience in 3D</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto" />
          </Link>
        </div>
      </div>
    </div>
  );
};
