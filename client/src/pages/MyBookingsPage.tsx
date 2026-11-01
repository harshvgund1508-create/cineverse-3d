import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Booking } from '../types';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  ShieldCheck,
  Film,
  LogIn,
  ChevronRight,
} from 'lucide-react';

export const MyBookingsPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBookings() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.bookings.getMy();
        setBookings(res.bookings);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch your bookings');
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 bg-cine-dark flex items-center justify-center">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl max-w-md w-full text-center border border-white/10 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-cine-cyan/20 text-cine-cyan flex items-center justify-center mx-auto mb-4 border border-cine-cyan/30">
            <Ticket className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            Sign In to View Bookings
          </h2>
          <p className="text-xs text-slate-400 mt-2 mb-6">
            Log in to access your digital tickets, QR codes, and 3D seat booking receipts.
          </p>
          <button
            onClick={openAuthModal}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cine-cyan to-cine-blue text-black font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-glow-cyan transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to CineVerse</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-cine-dark flex flex-col">
      <div className="max-w-5xl mx-auto w-full">
        {/* Title */}
        <div className="mb-8">
          <span className="text-xs text-cine-cyan font-bold uppercase tracking-wider">
            Booking History & Digital Passes
          </span>
          <h1 className="text-3xl font-extrabold text-white font-display mt-1">
            My CineVerse Passes
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            All your confirmed 3D movie reservations and cryptographically verified QR tickets.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center text-cine-cyan">
            <div className="w-10 h-10 border-4 border-cine-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl border border-white/10 p-8">
            <Film className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white font-display">No Bookings Found</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              You haven't reserved any 3D cinema tickets yet.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cine-cyan text-black font-bold text-xs hover:opacity-95 shadow-glow-cyan"
            >
              <span>Explore Movies & 3D Theatres</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="glass-card rounded-3xl p-6 border border-white/10 hover:border-cine-cyan/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Movie & Show Info */}
                <div className="flex items-start gap-4">
                  <div className="w-20 sm:w-24 aspect-[2/3] rounded-2xl overflow-hidden shrink-0 bg-black border border-white/10">
                    <img
                      src={booking.show.movie.posterUrl}
                      alt={booking.show.movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cine-cyan">
                        {booking.bookingRef}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white font-display">
                      {booking.show.movie.title}
                    </h3>

                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cine-cyan" />
                      <span>
                        {booking.show.auditorium.cinema?.name} • {booking.show.auditorium.name}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {booking.show.date}
                      </span>
                      <span className="flex items-center gap-1 text-cine-cyan font-bold font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {booking.show.startTime}
                      </span>
                    </div>

                    {/* Seat Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400">Seats:</span>
                      {booking.bookingSeats.map((bs) => (
                        <span
                          key={bs.id}
                          className="px-2 py-0.5 rounded-md bg-white/10 font-mono font-bold text-xs text-white"
                        >
                          {bs.seat.seatNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Billing & Ticket CTA */}
                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase block">Total Paid</span>
                    <span className="text-xl font-bold text-cine-cyan font-mono">
                      ₹{booking.totalAmount}
                    </span>
                  </div>

                  {booking.ticket && (
                    <Link
                      to={`/ticket/${booking.ticket.ticketCode}`}
                      className="mt-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cine-cyan to-cine-blue text-black font-bold text-xs flex items-center gap-2 hover:opacity-95 shadow-glow-cyan transition-all"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>View QR Ticket</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
