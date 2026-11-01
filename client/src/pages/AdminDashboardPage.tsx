import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Film,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Trash2,
  Edit,
  ShieldCheck,
  Search,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'MOVIES' | 'SHOWS' | 'BOOKINGS'>('ANALYTICS');
  const [analytics, setAnalytics] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchBooking, setSearchBooking] = useState<string>('');

  // New movie form modal
  const [showAddMovie, setShowAddMovie] = useState<boolean>(false);
  const [newMovie, setNewMovie] = useState({
    title: '',
    synopsis: '',
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    duration: 140,
    genre: 'Action, Sci-Fi',
    language: 'English',
    rating: 9.0,
    ageRating: 'UA 16+',
    director: '',
    cast: '',
  });

  // Schedule show form modal
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [newShow, setNewShow] = useState({
    movieId: '',
    auditoriumId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00 PM',
    endTime: '10:45 PM',
    basePriceMultiplier: 1.2,
  });

  const loadData = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [analyticsRes, moviesRes, bookingsRes, cinemasRes] = await Promise.all([
        api.admin.getAnalytics(),
        api.movies.getAll(),
        api.admin.getBookings(),
        api.cinemas.getAll(),
      ]);

      setAnalytics(analyticsRes);
      setMovies(moviesRes.movies);
      setBookings(bookingsRes.bookings);
      setCinemas(cinemasRes.cinemas);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.movies.create(newMovie);
      setShowAddMovie(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error creating movie');
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;
    try {
      await api.movies.delete(movieId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error deleting movie');
    }
  };

  const handleScheduleShow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.shows.create(newShow);
      setShowScheduleModal(false);
      loadData();
      alert('Show scheduled successfully with 3D seat coordinates initialized!');
    } catch (err: any) {
      alert(err.message || 'Error scheduling show');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Cancel this booking and release seats back to AVAILABLE?')) return;
    try {
      await api.admin.cancelBooking(bookingId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error cancelling booking');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 bg-cine-dark flex items-center justify-center">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl max-w-md w-full text-center border border-rose-500/30">
          <ShieldCheck className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white font-display">
            Admin Access Required
          </h2>
          <p className="text-xs text-slate-400 mt-2 mb-6">
            You must be logged in with an administrator account to view revenue analytics and manage auditoriums.
          </p>
          <button
            onClick={openAuthModal}
            className="w-full py-3 px-6 rounded-xl bg-cine-cyan text-black font-bold text-xs hover:opacity-95 shadow-glow-cyan"
          >
            Sign in as Director / Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-cine-dark flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-cine-cyan text-xs font-bold uppercase tracking-wider">
              <LayoutDashboard className="w-4 h-4" />
              <span>Cinema Command Operations</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white font-display mt-1">
              Admin & Analytics Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl glass-panel text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowAddMovie(true)}
              className="px-4 py-2 rounded-xl bg-cine-cyan text-black text-xs font-bold flex items-center gap-1.5 hover:opacity-95 shadow-glow-cyan"
            >
              <Plus className="w-4 h-4" />
              <span>Add Movie</span>
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 rounded-xl bg-cine-violet text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-95 shadow-glow-violet"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Show</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/5 max-w-xl">
          {(['ANALYTICS', 'MOVIES', 'BOOKINGS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-cine-cyan text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 1. ANALYTICS TAB */}
        {activeTab === 'ANALYTICS' && analytics && (
          <div className="space-y-8">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="glass-card rounded-3xl p-6 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-bold">
                    Verified Revenue
                  </span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    ₹{analytics.metrics.totalRevenue.toLocaleString()}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-cine-cyan/15 text-cine-cyan flex items-center justify-center border border-cine-cyan/30">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-bold">
                    Total Bookings
                  </span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {analytics.metrics.totalBookings}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-cine-violet/15 text-cine-violet flex items-center justify-center border border-cine-violet/30">
                  <Film className="w-6 h-6" />
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-bold">
                    Active Shows
                  </span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {analytics.metrics.totalShows}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-bold">
                    Auditorium Occupancy
                  </span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {analytics.metrics.occupancyRate}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Movie Performance Table & Category Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Top Movies */}
              <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white font-display mb-4">
                  Movie Revenue & Bookings
                </h3>
                <div className="space-y-3">
                  {analytics.movieStats.map((m: any) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          className="w-10 h-14 object-cover rounded-lg"
                        />
                        <div>
                          <div className="font-bold text-white text-xs line-clamp-1">{m.title}</div>
                          <div className="text-[11px] text-slate-400">{m.genre}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-cine-cyan">
                          ₹{m.revenue.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400">{m.bookingsCount} bookings</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white font-display mb-4">
                  Seat Category Economics
                </h3>
                <div className="space-y-3">
                  {analytics.categoryStats.map((cat: any) => (
                    <div
                      key={cat.id}
                      className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <div>
                          <div className="font-bold text-xs text-white">{cat.name}</div>
                          <div className="text-[10px] text-slate-400">
                            Base: ₹{cat.basePrice}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-white">
                          {cat.soldCount} seats
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          ₹{cat.revenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MOVIES MANAGEMENT TAB */}
        {activeTab === 'MOVIES' && (
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white font-display">All Cinema Titles</h3>
              <button
                onClick={() => setShowAddMovie(true)}
                className="px-4 py-2 rounded-xl bg-cine-cyan text-black font-bold text-xs flex items-center gap-1.5 shadow-glow-cyan"
              >
                <Plus className="w-4 h-4" />
                <span>Add Movie</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {movies.map((m) => (
                <div
                  key={m.id}
                  className="glass-card rounded-2xl p-4 border border-white/5 flex gap-4 justify-between"
                >
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    className="w-16 h-24 object-cover rounded-xl shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white line-clamp-1">{m.title}</h4>
                      <div className="text-[11px] text-slate-400 mt-0.5">{m.duration} mins • {m.genre}</div>
                      <div className="text-[10px] text-cine-cyan font-mono mt-1 line-clamp-1">
                        Trailer: {m.trailerUrl}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleDeleteMovie(m.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
                        title="Delete movie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. BOOKINGS MANAGEMENT TAB */}
        {activeTab === 'BOOKINGS' && (
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-white font-display">
                All Verified Customer Bookings
              </h3>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search booking ref, customer..."
                  value={searchBooking}
                  onChange={(e) => setSearchBooking(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-cine-cyan"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-slate-400 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Ref & Customer</th>
                    <th className="p-3.5">Movie & Auditorium</th>
                    <th className="p-3.5">Showtime</th>
                    <th className="p-3.5">Seats</th>
                    <th className="p-3.5">Total Paid</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings
                    .filter(
                      (b) =>
                        !searchBooking ||
                        b.bookingRef.toLowerCase().includes(searchBooking.toLowerCase()) ||
                        b.user?.name.toLowerCase().includes(searchBooking.toLowerCase())
                    )
                    .map((b) => (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white font-mono">{b.bookingRef}</div>
                          <div className="text-[11px] text-slate-400">{b.user?.name}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-white">{b.show?.movie?.title}</div>
                          <div className="text-[10px] text-slate-400">
                            {b.show?.auditorium?.name}
                          </div>
                        </td>
                        <td className="p-3.5 font-mono">
                          <div>{b.show?.date}</div>
                          <div className="text-cine-cyan">{b.show?.startTime}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {b.bookingSeats?.map((bs: any) => (
                              <span
                                key={bs.id}
                                className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white"
                              >
                                {bs.seat?.seatNumber}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 font-bold font-mono text-cine-cyan">
                          ₹{b.totalAmount}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              b.status === 'CONFIRMED'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {b.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-[11px] font-semibold transition-colors"
                            >
                              Cancel & Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: Add New Movie */}
        {showAddMovie && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold text-white font-display mb-4">Add Movie Title</h3>
              <form onSubmit={handleCreateMovie} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newMovie.title}
                    onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Synopsis</label>
                  <textarea
                    required
                    rows={2}
                    value={newMovie.synopsis}
                    onChange={(e) => setNewMovie({ ...newMovie, synopsis: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Poster URL</label>
                    <input
                      type="text"
                      required
                      value={newMovie.posterUrl}
                      onChange={(e) => setNewMovie({ ...newMovie, posterUrl: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Trailer Video Stream (.mp4)</label>
                    <input
                      type="text"
                      required
                      value={newMovie.trailerUrl}
                      onChange={(e) => setNewMovie({ ...newMovie, trailerUrl: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Duration (min)</label>
                    <input
                      type="number"
                      value={newMovie.duration}
                      onChange={(e) => setNewMovie({ ...newMovie, duration: Number(e.target.value) })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Genre</label>
                    <input
                      type="text"
                      value={newMovie.genre}
                      onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newMovie.rating}
                      onChange={(e) => setNewMovie({ ...newMovie, rating: Number(e.target.value) })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddMovie(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-cine-cyan text-black font-bold"
                  >
                    Create Movie
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Schedule Show */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold text-white font-display mb-4">Schedule Showtime</h3>
              <form onSubmit={handleScheduleShow} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">Select Movie</label>
                  <select
                    required
                    value={newShow.movieId}
                    onChange={(e) => setNewShow({ ...newShow, movieId: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="">Choose Movie...</option>
                    {movies.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Auditorium</label>
                  <select
                    required
                    value={newShow.auditoriumId}
                    onChange={(e) => setNewShow({ ...newShow, auditoriumId: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="">Choose Auditorium...</option>
                    {cinemas.flatMap((c) =>
                      c.auditoriums.map((a: any) => (
                        <option key={a.id} value={a.id}>
                          {c.name} — {a.name} ({a.screenType})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={newShow.date}
                      onChange={(e) => setNewShow({ ...newShow, date: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Start Time</label>
                    <input
                      type="text"
                      required
                      placeholder="08:15 PM"
                      value={newShow.startTime}
                      onChange={(e) => setNewShow({ ...newShow, startTime: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Price Multiplier</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newShow.basePriceMultiplier}
                    onChange={(e) =>
                      setNewShow({ ...newShow, basePriceMultiplier: Number(e.target.value) })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-cine-violet text-white font-bold"
                  >
                    Schedule & Populate 3D Seats
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
