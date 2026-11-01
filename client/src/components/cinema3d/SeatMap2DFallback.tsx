import React from 'react';
import { Seat } from '../../types';

interface SeatMap2DFallbackProps {
  seats: Seat[];
  selectedSeatIds: string[];
  activePreviewSeatId: string | null;
  onSeatClick: (seat: Seat) => void;
  onSwitchTo3D: () => void;
}

export const SeatMap2DFallback: React.FC<SeatMap2DFallbackProps> = ({
  seats,
  selectedSeatIds,
  activePreviewSeatId,
  onSeatClick,
  onSwitchTo3D,
}) => {
  // Group seats by Row (A to K)
  const rowsMap = new Map<string, Seat[]>();
  seats.forEach((seat) => {
    if (!rowsMap.has(seat.row)) {
      rowsMap.set(seat.row, []);
    }
    rowsMap.get(seat.row)!.push(seat);
  });

  // Sort rows in reverse so A is closest to screen
  const rowKeys = Array.from(rowsMap.keys()).sort();

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto bg-cine-dark/95">
      {/* 2D Cinema Screen Curve */}
      <div className="w-full max-w-2xl flex flex-col items-center mb-8">
        <div className="w-4/5 h-2.5 rounded-t-full bg-gradient-to-r from-transparent via-cine-cyan to-transparent shadow-[0_-10px_35px_rgba(0,240,255,0.6)]" />
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">
          CINEMA SCREEN
        </span>
      </div>

      {/* Grid of Rows */}
      <div className="w-full max-w-4xl flex flex-col gap-2.5 items-center">
        {rowKeys.map((rowKey) => {
          const rowSeats = rowsMap.get(rowKey)!.sort((a, b) => a.col - b.col);
          const leftCol = rowSeats.filter((s) => s.col <= 7);
          const rightCol = rowSeats.filter((s) => s.col >= 8);

          return (
            <div key={rowKey} className="flex items-center gap-3 sm:gap-6">
              {/* Row letter left */}
              <span className="w-5 text-center font-bold text-xs text-slate-400 font-mono">
                {rowKey}
              </span>

              {/* Left Seat Bank */}
              <div className="flex gap-1.5 sm:gap-2">
                {leftCol.map((seat) => renderSeatButton(seat, selectedSeatIds, activePreviewSeatId, onSeatClick))}
              </div>

              {/* Aisle Walkway */}
              <div className="w-4 sm:w-8 flex items-center justify-center">
                <span className="text-[10px] text-slate-600 font-mono">||</span>
              </div>

              {/* Right Seat Bank */}
              <div className="flex gap-1.5 sm:gap-2">
                {rightCol.map((seat) => renderSeatButton(seat, selectedSeatIds, activePreviewSeatId, onSeatClick))}
              </div>

              {/* Row letter right */}
              <span className="w-5 text-center font-bold text-xs text-slate-400 font-mono">
                {rowKey}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend & Switch to 3D */}
      <div className="mt-8 pt-4 border-t border-white/10 w-full max-w-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-emerald-500" />
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-amber-500" />
            <span className="text-slate-300">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-rose-500" />
            <span className="text-slate-300">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-600" />
            <span className="text-slate-300">Locked</span>
          </div>
        </div>

        <button
          onClick={onSwitchTo3D}
          className="px-4 py-1.5 rounded-xl bg-cine-cyan/20 hover:bg-cine-cyan text-cine-cyan hover:text-black font-semibold transition-colors flex items-center gap-1.5"
        >
          <span>Switch to 3D Immersive View</span>
        </button>
      </div>
    </div>
  );
};

function renderSeatButton(
  seat: Seat,
  selectedSeatIds: string[],
  activePreviewSeatId: string | null,
  onSeatClick: (seat: Seat) => void
) {
  const isSelected = selectedSeatIds.includes(seat.id);
  const isPreview = activePreviewSeatId === seat.id;
  const isBooked = seat.status === 'BOOKED';
  const isLocked = seat.status === 'LOCKED';

  let bgClass = 'hover:scale-110';
  let style: React.CSSProperties = {
    backgroundColor: `${seat.category.color}30`,
    borderColor: seat.category.color,
  };

  if (isBooked) {
    bgClass = 'bg-rose-500/80 border-rose-600 text-white cursor-not-allowed';
    style = {};
  } else if (isLocked) {
    bgClass = 'bg-slate-600/60 border-slate-500 text-slate-400 cursor-not-allowed';
    style = {};
  } else if (isSelected) {
    bgClass = 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/50 scale-105';
    style = {};
  } else if (isPreview) {
    bgClass = 'bg-cine-cyan text-black border-cine-cyan shadow-lg shadow-cine-cyan/50 animate-pulse';
    style = {};
  }

  return (
    <button
      key={seat.id}
      disabled={isBooked || isLocked}
      onClick={() => onSeatClick(seat)}
      title={`${seat.seatNumber} • ${seat.category.name} (₹${seat.price}) - ${seat.status}`}
      style={style}
      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md border text-[10px] font-bold font-mono flex items-center justify-center transition-all ${bgClass}`}
    >
      {seat.col}
    </button>
  );
}
