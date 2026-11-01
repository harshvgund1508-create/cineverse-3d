import React from 'react';
import { X, Eye, Check, AlertCircle, Compass, Ruler, Sparkles } from 'lucide-react';
import { Seat, SeatMetrics } from '../../types';

interface SeatComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  seatsToCompare: Seat[];
  onRemoveSeat: (seatId: string) => void;
  onSwitchToSeatView: (seat: Seat) => void;
  onToggleSelectSeat: (seat: Seat) => void;
  selectedSeatIds: string[];
}

export function computeSeatMetrics(seat: Seat): SeatMetrics {
  const screenCenterX = 0;
  const screenCenterY = 4.2;
  const screenCenterZ = -10.0;

  const eyeX = seat.coordX;
  const eyeY = seat.coordY + 0.82;
  const eyeZ = seat.coordZ + 0.05;

  const dx = eyeX - screenCenterX;
  const dy = eyeY - screenCenterY;
  const dz = eyeZ - screenCenterZ;

  const distanceMeters = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const horizontalAngleDeg = Math.atan2(Math.abs(dx), Math.abs(dz)) * (180 / Math.PI);
  const verticalAngleDeg = Math.atan2(Math.abs(dy), Math.abs(dz)) * (180 / Math.PI);

  return {
    seat,
    distanceMeters: Number(distanceMeters.toFixed(2)),
    horizontalAngleDeg: Number(horizontalAngleDeg.toFixed(1)),
    verticalAngleDeg: Number(verticalAngleDeg.toFixed(1)),
  };
}

export const SeatComparisonModal: React.FC<SeatComparisonModalProps> = ({
  isOpen,
  onClose,
  seatsToCompare,
  onRemoveSeat,
  onSwitchToSeatView,
  onToggleSelectSeat,
  selectedSeatIds,
}) => {
  if (!isOpen) return null;

  const metricsList = seatsToCompare.map((s) => computeSeatMetrics(s));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-4xl rounded-3xl p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-cine-cyan/20 text-cine-cyan text-xs font-semibold uppercase tracking-wider">
                3D Geometric Analysis
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                Seat Viewing Comparison
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Exact 3D camera coordinates, eye-level distance, and optical screen angles calculated in real time.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Cards Grid */}
        <div className="py-6 overflow-y-auto flex-1">
          {metricsList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-3">
              <AlertCircle className="w-10 h-10 text-slate-500" />
              <p>No seats added for comparison yet.</p>
              <p className="text-xs text-slate-500">
                Click any seat in the 3D theatre to preview and compare multiple views!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {metricsList.map(({ seat, distanceMeters, horizontalAngleDeg, verticalAngleDeg }) => {
                const isSelected = selectedSeatIds.includes(seat.id);
                // THX optimum angle is 36° - 40° field of view, horizontal distortion < 10°
                const isSweetSpot = horizontalAngleDeg <= 8 && distanceMeters >= 12 && distanceMeters <= 18;

                return (
                  <div
                    key={seat.id}
                    className="glass-card rounded-2xl p-5 flex flex-col justify-between border border-white/10 relative hover:border-cine-cyan/40 transition-all duration-200"
                  >
                    {isSweetSpot && (
                      <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-cine-cyan text-black text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 shadow-lg shadow-cine-cyan/30">
                        <Sparkles className="w-3 h-3" />
                        THX Sweet Spot
                      </div>
                    )}

                    <div>
                      {/* Seat Top Row */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg text-white font-mono border border-white/20">
                            {seat.seatNumber}
                          </span>
                          <div>
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${seat.category.color}25`,
                                color: seat.category.color,
                              }}
                            >
                              {seat.category.name}
                            </span>
                            <div className="text-lg font-bold text-white mt-0.5">
                              ₹{seat.price}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveSeat(seat.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Mathematical Geometry Metrics */}
                      <div className="space-y-2.5 bg-black/40 rounded-xl p-3 border border-white/5 text-xs">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Ruler className="w-3.5 h-3.5 text-cine-cyan" />
                            Distance to Screen:
                          </span>
                          <span className="font-mono font-bold text-white">
                            {distanceMeters} m
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Compass className="w-3.5 h-3.5 text-cine-violet" />
                            Horizontal Offset:
                          </span>
                          <span className="font-mono font-bold text-white">
                            {horizontalAngleDeg}° {horizontalAngleDeg < 5 ? '(Dead Center)' : ''}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            Vertical Viewing Pitch:
                          </span>
                          <span className="font-mono font-bold text-white">
                            {verticalAngleDeg}° {verticalAngleDeg < 6 ? '(Eye-level)' : '(Slight Up)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-5 pt-3 border-t border-white/10">
                      <button
                        onClick={() => {
                          onSwitchToSeatView(seat);
                          onClose();
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-cine-cyan hover:text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Experience View
                      </button>

                      <button
                        onClick={() => onToggleSelectSeat(seat)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-black hover:bg-amber-400'
                            : 'bg-cine-cyan/20 text-cine-cyan hover:bg-cine-cyan hover:text-black'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Geometry notice footer */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <span>
            * Measurements are 3D geometry-based trigonometric estimates calculated from virtual auditorium coordinates.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
