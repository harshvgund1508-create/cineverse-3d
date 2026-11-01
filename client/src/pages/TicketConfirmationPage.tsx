import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import {
  CheckCircle,
  Download,
  Share2,
  Calendar,
  Clock,
  MapPin,
  Film,
  Sparkles,
  ShieldCheck,
  Printer,
  ChevronRight,
} from 'lucide-react';

export const TicketConfirmationPage: React.FC = () => {
  const { ticketCode } = useParams<{ ticketCode: string }>();
  const [ticketData, setTicketData] = useState<any>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const ticketPrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00F0FF', '#8B5CF6', '#F59E0B', '#10B981'],
    });

    async function loadTicket() {
      if (!ticketCode) return;
      try {
        const res = await api.bookings.verifyQr(ticketCode);
        setTicketData(res);

        // Generate QR code Data URL
        const qr = await QRCode.toDataURL(
          JSON.stringify({
            ticketCode: res.ticketCode,
            bookingRef: res.bookingRef,
            movie: res.movie,
            seats: res.seats,
            verified: true,
          }),
          {
            width: 300,
            margin: 2,
            color: {
              dark: '#070913',
              light: '#FFFFFF',
            },
          }
        );
        setQrImageUrl(qr);
      } catch (err: any) {
        setError(err.message || 'Failed to load ticket.');
      } finally {
        setLoading(false);
      }
    }

    loadTicket();
  }, [ticketCode]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cine-dark">
        <div className="flex flex-col items-center gap-3 text-cine-cyan">
          <div className="w-12 h-12 border-4 border-cine-cyan border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wide">Generating Verified 3D Cinema Pass...</p>
        </div>
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-cine-dark text-center">
        <div className="glass-panel p-8 rounded-3xl max-w-md border border-rose-500/30">
          <p className="text-rose-400 font-bold mb-2">Ticket Verification Notice</p>
          <p className="text-sm text-slate-300">{error || 'Ticket could not be verified.'}</p>
          <Link
            to="/"
            className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
          >
            Return to CineVerse 3D
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-cine-dark flex flex-col items-center">
      {/* Top Success Banner */}
      <div className="max-w-2xl w-full text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>Booking Verified & Confirmed</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Your Cinema Ticket is Ready!
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2">
          Present this digital QR ticket at the cinema turnstile.
        </p>
      </div>

      {/* Luxury Holographic Cinema Ticket Card */}
      <div
        ref={ticketPrintRef}
        className="w-full max-w-xl glass-panel rounded-3xl overflow-hidden border border-white/20 shadow-2xl relative bg-gradient-to-b from-[#10162B] via-[#0C101F] to-[#070913]"
      >
        {/* Decorative Top Accent Glow */}
        <div className="h-2 w-full bg-gradient-to-r from-cine-cyan via-cine-blue to-cine-violet" />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-cine-cyan font-bold text-lg tracking-wider font-display">
                <Sparkles className="w-5 h-5" />
                <span>CINEVERSE 3D</span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase mt-0.5">
                EXPERIENCE YOUR VIEW PASS
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Booking Ref</span>
              <div className="text-sm font-mono font-bold text-white tracking-wider">
                {ticketData.bookingRef}
              </div>
            </div>
          </div>

          {/* Movie Details */}
          <div className="py-6 border-b border-white/10">
            <span className="px-2.5 py-1 rounded-md bg-cine-cyan/15 text-cine-cyan text-[11px] font-bold font-mono">
              {ticketData.auditorium}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-2">
              {ticketData.movie}
            </h2>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
              <MapPin className="w-3.5 h-3.5 text-cine-cyan" />
              <span>{ticketData.cinema}</span>
            </div>

            {/* Show info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Date
                </span>
                <span className="font-bold text-white mt-1 block font-mono">{ticketData.date}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Showtime
                </span>
                <span className="font-bold text-cine-cyan mt-1 block font-mono">
                  {ticketData.time}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-400 text-[10px] uppercase">Reserved Seats</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ticketData.seats.map((seatNum: string) => (
                    <span
                      key={seatNum}
                      className="px-2 py-0.5 rounded bg-cine-cyan/20 border border-cine-cyan/40 text-cine-cyan font-bold font-mono text-xs"
                    >
                      {seatNum}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Perforated Ticket Notch Visual */}
          <div className="relative py-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-dashed border-white/20">
            {/* Left cutout circle */}
            <div className="hidden sm:block absolute -left-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cine-dark border-r border-white/20" />
            {/* Right cutout circle */}
            <div className="hidden sm:block absolute -right-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cine-dark border-l border-white/20" />

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div className="p-3 bg-white rounded-2xl shadow-xl">
                {qrImageUrl ? (
                  <img src={qrImageUrl} alt="Ticket QR Code" className="w-36 h-36 object-contain" />
                ) : (
                  <div className="w-36 h-36 bg-slate-200 animate-pulse rounded" />
                )}
              </div>
              <span className="font-mono text-xs text-slate-300 mt-2 font-bold tracking-widest">
                {ticketData.ticketCode}
              </span>
            </div>

            {/* Customer & Billing Info */}
            <div className="flex-1 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Guest Name:</span>
                <span className="text-white font-medium">{ticketData.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Mode:</span>
                <span className="text-white font-medium">{ticketData.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Verification:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Authentic
                </span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2 border-t border-white/10 text-sm font-bold">
                <span className="text-white">Amount Paid:</span>
                <span className="text-cine-cyan font-mono text-base">₹{ticketData.amount}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-4 text-center text-[11px] text-slate-500">
            Scan this QR code at cinema entrance gate. Valid for 1 admission per seat.
          </div>
        </div>
      </div>

      {/* Ticket Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-8 print:hidden">
        <button
          onClick={handlePrint}
          className="px-6 py-3 rounded-2xl glass-panel hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all border border-white/10 shadow-lg"
        >
          <Printer className="w-4 h-4 text-cine-cyan" />
          <span>Print / Save as PDF</span>
        </button>

        <Link
          to="/my-bookings"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cine-cyan to-cine-blue text-black font-bold text-xs flex items-center gap-2 hover:opacity-95 transition-all shadow-glow-cyan"
        >
          <span>View in My Bookings</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
