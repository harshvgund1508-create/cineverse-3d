import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useBooking } from '../context/BookingContext';
import { CinemaCanvas } from '../components/cinema3d/CinemaCanvas';
import { BookingSidebar } from '../components/booking/BookingSidebar';
import { CheckoutModal } from '../components/booking/CheckoutModal';
import { SnacksModal } from '../components/booking/SnacksModal';
import { Seat, Show } from '../types';
import { ArrowLeft, RefreshCw, Sparkles, MapPin, Film } from 'lucide-react';

export const Auditorium3DPage: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const {
    setSelectedMovie,
    setSelectedShow,
    selectedSeats,
    toggleSeatSelection,
    activePreviewSeat,
    setActivePreviewSeat,
    unlockSeats,
    finalTotal,
  } = useBooking();

  const [show, setShow] = useState<Show | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSnacksOpen, setIsSnacksOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  const fetchShowData = async () => {
    if (!showId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.shows.getById(showId);
      setShow(res.show);
      setSeats(res.seats);
      setSelectedShow(res.show);
      setSelectedMovie(res.show.movie);
    } catch (err: any) {
      setError(err.message || 'Failed to load 3D auditorium.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowData();
    return () => {
      unlockSeats();
    };
  }, [showId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070911]">
        <div className="flex flex-col items-center gap-3 text-cine-cyan">
          <div className="w-12 h-12 border-4 border-cine-cyan border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wide text-slate-300">
            Calibrating 3D Virtual Auditorium & Screen Optics...
          </p>
        </div>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#070911] text-center">
        <div className="glass-panel p-8 rounded-3xl max-w-md border border-rose-500/30">
          <p className="text-rose-400 font-bold mb-2">Auditorium Unavailable</p>
          <p className="text-sm text-slate-300">{error || 'Showtime data not found.'}</p>
          <Link
            to="/movies"
            className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
          >
            Browse Movies
          </Link>
        </div>
      </div>
    );
  }

  const selectedSeatIds = selectedSeats.map((s) => s.id);

  // Format breadcrumb text matching viral reel:
  // e.g. "Starlight Cinemas: MG Road | Today 29 Oct | 10:45 PM | 4DX | Hindi"
  const cinemaName = show.auditorium.cinema?.name || 'Starlight Cinemas: MG Road';
  const showDateFormatted = show.date || 'Today 29 Oct';
  const showTime = show.startTime || '10:45 PM';
  const formatTag = '4DX';
  const language = show.movie.language || 'Hindi';

  return (
    <div className="min-h-screen pt-16 pb-8 px-3 sm:px-6 lg:px-8 bg-[#070911] flex flex-col justify-between">
      
      {/* Top Header Bar Matching Viral Reel */}
      <div className="max-w-[1700px] mx-auto w-full mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <Link
              to={`/movies/${show.movie.id}`}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-wide uppercase">
              {show.movie.title}
            </h1>
          </div>
          
          {/* Metadata String: Starlight Cinemas: MG Road | Today 29 Oct | 10:45 PM | 4DX | Hindi */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mt-0.5 font-medium">
            <span>{cinemaName}</span>
            <span className="text-slate-600">•</span>
            <span>{showDateFormatted}</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-mono font-bold">{showTime}</span>
            <span className="text-slate-600">•</span>
            <span className="px-1.5 py-0.2 rounded bg-white/10 text-[11px] text-slate-200 font-bold font-mono">
              {formatTag}
            </span>
            <span className="text-slate-600">•</span>
            <span>{language}</span>
          </div>
        </div>

        {/* Quick Refresh Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchShowData}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1.5 border border-white/10"
            title="Refresh Seat Status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Theatre Layout */}
      <div className="max-w-[1700px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[680px]">
        
        {/* 3D Cinema Canvas (8 cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col h-[580px] sm:h-[680px] lg:h-full">
          <CinemaCanvas
            trailerUrl={show.movie.trailerUrl}
            movieTitle={show.movie.title}
            seats={seats}
            selectedSeatIds={selectedSeatIds}
            onToggleSelectSeat={toggleSeatSelection}
            activePreviewSeat={activePreviewSeat}
            onSetActivePreviewSeat={setActivePreviewSeat}
          />
        </div>

        {/* Real-time Booking Sidebar (4 cols on desktop) */}
        <div className="lg:col-span-4 flex flex-col h-[580px] sm:h-[680px] lg:h-full">
          <BookingSidebar
            seats={seats}
            onOpenSnacks={() => setIsSnacksOpen(true)}
            onSelectSeatView={setActivePreviewSeat}
          />
        </div>
      </div>

      {/* Gourmet Snacks Add-On Modal */}
      <SnacksModal
        isOpen={isSnacksOpen}
        onClose={() => setIsSnacksOpen(false)}
        onProceed={(selectedSnacks) => {
          setIsSnacksOpen(false);
          setIsCheckoutOpen(true);
        }}
        ticketSubtotal={finalTotal}
      />

      {/* Checkout & Razorpay Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
};
