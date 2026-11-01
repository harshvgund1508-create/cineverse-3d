import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Cinema } from '../types';
import { MapPin, Sparkles, Film, ArrowRight, ShieldCheck } from 'lucide-react';

export const CinemasPage: React.FC = () => {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadCinemas() {
      try {
        setLoading(true);
        const res = await api.cinemas.getAll();
        setCinemas(res.cinemas);
      } catch (err) {
        console.error('Failed to load cinemas:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCinemas();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-cine-dark flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="px-3.5 py-1 rounded-full bg-cine-cyan/20 border border-cine-cyan/40 text-cine-cyan text-xs font-bold uppercase tracking-wider">
            Signature Destinations
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display mt-3">
            CineVerse 3D Theatres
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            Experience laser projection, custom acoustic modeling, and stadium stadium seating.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center text-cine-cyan">
            <div className="w-10 h-10 border-4 border-cine-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cinemas.map((cinema) => (
              <div
                key={cinema.id}
                className="glass-card rounded-3xl overflow-hidden border border-white/10 group flex flex-col justify-between"
              >
                <div>
                  <div className="h-60 relative overflow-hidden bg-black">
                    <img
                      src={cinema.imageUrl}
                      alt={cinema.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cine-dark via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-xs font-bold text-cine-cyan border border-cine-cyan/30">
                      {cinema.city}
                    </span>
                  </div>

                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-white font-display">
                      {cinema.name}
                    </h2>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cine-cyan shrink-0" />
                      <span>{cinema.address}</span>
                    </p>

                    <div className="mt-4 pt-4 border-t border-white/5">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2">
                        Premium Amenities & Formats
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cinema.facilities.split(',').map((f, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px] text-slate-300"
                          >
                            {f.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {cinema.auditoriums && cinema.auditoriums.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2">
                          Interactive 3D Auditoriums
                        </span>
                        <div className="space-y-2">
                          {cinema.auditoriums.map((audi) => (
                            <div
                              key={audi.id}
                              className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-white block">{audi.name}</span>
                                <span className="text-[10px] text-cine-cyan">{audi.screenType}</span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {audi.soundSystem}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    to="/"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cine-cyan to-cine-blue text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-95 shadow-glow-cyan transition-all"
                  >
                    <span>Browse Showtime Schedule</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
