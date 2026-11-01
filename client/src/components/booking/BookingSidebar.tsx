import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { Seat } from '../../types';
import { Sparkles, X, Minus, Plus, ArrowRight, Clock, AlertTriangle, Eye } from 'lucide-react';

interface BookingSidebarProps {
  seats?: Seat[];
  onOpenSnacks: () => void;
  onSelectSeatView?: (seat: Seat) => void;
}

export const BookingSidebar: React.FC<BookingSidebarProps> = ({
  seats = [],
  onOpenSnacks,
  onSelectSeatView,
}) => {
  const { user, openAuthModal } = useAuth();
  const {
    selectedShow,
    selectedSeats,
    toggleSeatSelection,
    removeSeat,
    clearSelectedSeats,
    isLocked,
    lockSecondsRemaining,
    lockSeats,
    lockError,
    totalSeatPrice,
    convenienceFee,
    finalTotal,
  } = useBooking();

  const [quickPickCount, setQuickPickCount] = useState<number>(2);
  const [loadingLock, setLoadingLock] = useState<boolean>(false);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Helper to find a representative seat for a category and sit the user in it
  const handlePreviewCategorySeat = (catName: string) => {
    if (!seats || seats.length === 0 || !onSelectSeatView) return;

    // Find center-aligned seat in this category
    const matchingSeats = seats.filter(
      (s) => s.category.name.toLowerCase().includes(catName.toLowerCase()) && s.status !== 'BOOKED'
    );

    if (matchingSeats.length > 0) {
      // Pick seat closest to center
      matchingSeats.sort((a, b) => Math.abs(a.coordX) - Math.abs(b.coordX));
      onSelectSeatView(matchingSeats[0]);
    }
  };

  // Handler for Quick Pick "Best 2 seats" (THX Sweet Spot, Row F or G center)
  const handleQuickPickBestSeats = () => {
    if (!seats || seats.length === 0) return;

    const available = seats.filter(
      (s) => s.status !== 'BOOKED' && s.status !== 'LOCKED'
    );

    const scored = [...available].sort((a, b) => {
      const distA = Math.abs(a.coordX) + Math.abs(a.row.charCodeAt(0) - 'F'.charCodeAt(0)) * 1.5;
      const distB = Math.abs(b.coordX) + Math.abs(b.row.charCodeAt(0) - 'F'.charCodeAt(0)) * 1.5;
      return distA - distB;
    });

    const bestPicks = scored.slice(0, quickPickCount);
    clearSelectedSeats();
    bestPicks.forEach((seat) => toggleSeatSelection(seat));
  };

  const handleProceed = async () => {
    if (selectedSeats.length === 0) return;

    if (!user) {
      openAuthModal();
      return;
    }

    if (!isLocked) {
      setLoadingLock(true);
      const locked = await lockSeats();
      setLoadingLock(false);
      if (!locked) return;
    }

    onOpenSnacks();
  };

  return (
    <div className="w-full bg-[#0D101A]/95 backdrop-blur-2xl rounded-3xl p-5 border border-white/10 shadow-2xl flex flex-col justify-between h-full text-white">
      <div className="space-y-4">
        
        {/* 1. Header: SEAT CLASSES with hint */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <span className="text-[11px] font-black tracking-widest text-slate-400 uppercase block">
              SEAT CLASSES
            </span>
            <span className="text-[9px] text-amber-400">Click any class to sit & test view</span>
          </div>

          {isLocked && lockSecondsRemaining > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-mono font-bold animate-pulse">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{formatTimer(lockSecondsRemaining)}</span>
            </div>
          )}
        </div>

        {/* 2. Four Category Cards with Instant "Sit & View" Click (Matching viral reel!) */}
        <div className="space-y-2">
          {/* Royal Recliner (Gold) */}
          <div
            onClick={() => handlePreviewCategorySeat('Royal Recliner')}
            className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-amber-500/60 hover:bg-white/[0.08] cursor-pointer transition-all flex items-center justify-between relative overflow-hidden group shadow-sm"
            title="Click to sit in Royal Recliner and test view"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#EAB308] rounded-l" />
            <div className="pl-2">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                  Royal Recliner
                </h4>
                <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-[9px] text-amber-300 font-bold flex items-center gap-0.5">
                  <Eye className="w-2.5 h-2.5" /> View
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Motorised recliners - F&B to seat</p>
            </div>
            <span className="text-xs font-black text-amber-400 font-mono">₹480</span>
          </div>

          {/* Balcony (Purple) */}
          <div
            onClick={() => handlePreviewCategorySeat('Balcony')}
            className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-purple-500/60 hover:bg-white/[0.08] cursor-pointer transition-all flex items-center justify-between relative overflow-hidden group shadow-sm"
            title="Click to sit in Balcony and test view"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#8B5CF6] rounded-l" />
            <div className="pl-2">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                  Balcony
                </h4>
                <span className="px-1.5 py-0.2 rounded bg-purple-400/20 text-[9px] text-purple-300 font-bold flex items-center gap-0.5">
                  <Eye className="w-2.5 h-2.5" /> View
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Elevated view - centre aligned</p>
            </div>
            <span className="text-xs font-black text-purple-400 font-mono">₹280</span>
          </div>

          {/* Prime (Green) */}
          <div
            onClick={() => handlePreviewCategorySeat('Prime')}
            className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-emerald-500/60 hover:bg-white/[0.08] cursor-pointer transition-all flex items-center justify-between relative overflow-hidden group shadow-sm"
            title="Click to sit in Prime (G8 Sweet Spot) and test view"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#10B981] rounded-l" />
            <div className="pl-2">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Prime
                </h4>
                <span className="px-1.5 py-0.2 rounded bg-emerald-400/20 text-[9px] text-emerald-300 font-bold flex items-center gap-0.5">
                  <Eye className="w-2.5 h-2.5" /> View
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Sweet spot for sound & picture</p>
            </div>
            <span className="text-xs font-black text-emerald-400 font-mono">₹220</span>
          </div>

          {/* Classic (Blue) */}
          <div
            onClick={() => handlePreviewCategorySeat('Classic')}
            className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-sky-500/60 hover:bg-white/[0.08] cursor-pointer transition-all flex items-center justify-between relative overflow-hidden group shadow-sm"
            title="Click to sit in Classic front rows and test view"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0EA5E9] rounded-l" />
            <div className="pl-2">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">
                  Classic
                </h4>
                <span className="px-1.5 py-0.2 rounded bg-sky-400/20 text-[9px] text-sky-300 font-bold flex items-center gap-0.5">
                  <Eye className="w-2.5 h-2.5" /> View
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Front rows - big screen energy</p>
            </div>
            <span className="text-xs font-black text-sky-400 font-mono">₹160</span>
          </div>
        </div>

        {/* 3. Status Legend Bar */}
        <div className="flex items-center justify-between pt-1 pb-1 text-[11px] text-slate-400 px-1 border-t border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#334155]" />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
            <span className="text-white font-medium">Your pick</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
            <span>Couple recliner</span>
          </div>
        </div>

        {/* 4. QUICK PICK Section */}
        <div>
          <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">
            QUICK PICK
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-black/50 border border-white/10 rounded-2xl p-1">
              <button
                onClick={() => setQuickPickCount((prev) => Math.max(1, prev - 1))}
                className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-xs font-bold font-mono text-white">
                {quickPickCount}
              </span>
              <button
                onClick={() => setQuickPickCount((prev) => Math.min(6, prev + 1))}
                className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleQuickPickBestSeats}
              className="flex-1 py-2 px-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 group shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Best {quickPickCount} seats</span>
            </button>
          </div>
        </div>

        {/* 5. YOUR SEATS Section */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">
            <span>YOUR SEATS ({selectedSeats.length})</span>
            {selectedSeats.length > 0 && (
              <button
                onClick={clearSelectedSeats}
                className="text-[10px] text-slate-400 hover:text-rose-400 font-bold transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {selectedSeats.length === 0 ? (
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-center text-[11px] text-slate-400">
              Click any seat in 3D or hit <span className="text-amber-400 font-bold">Best {quickPickCount} seats</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {selectedSeats.map((seat) => (
                <div
                  key={seat.id}
                  className="px-2.5 py-1 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] text-xs font-bold font-mono flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.2)] animate-fadeIn"
                >
                  <span>{seat.seatNumber}</span>
                  <button
                    onClick={() => removeSeat(seat.id)}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {lockError && (
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-[11px] text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{lockError}</span>
          </div>
        )}
      </div>

      {/* 6. Pricing Summary & Action CTA Button */}
      <div className="pt-3 border-t border-white/10 space-y-3 mt-3">
        <div className="flex items-baseline justify-between">
          <div className="text-[11px] text-slate-400">
            <span>{selectedSeats.length} {selectedSeats.length === 1 ? 'ticket' : 'tickets'}</span>
            <span className="text-slate-500 ml-1">+ fees ₹{convenienceFee}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              ₹{finalTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <button
          onClick={handleProceed}
          disabled={selectedSeats.length === 0 || loadingLock}
          className={`w-full py-3.5 px-4 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
            selectedSeats.length === 0
              ? 'bg-white/10 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black hover:brightness-110 active:scale-[0.98] shadow-amber-500/30'
          }`}
        >
          {loadingLock ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>CONTINUE - ADD SNACKS</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
