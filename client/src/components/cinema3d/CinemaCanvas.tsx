import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { CinemaAuditorium } from './CinemaAuditorium';
import { CinemaScreen } from './CinemaScreen';
import { CinemaSeats } from './CinemaSeats';
import { CameraController, CameraPreset } from './CameraController';
import { TrailerControls } from './TrailerControls';
import { SeatComparisonModal } from './SeatComparisonModal';
import { SeatMap2DFallback } from './SeatMap2DFallback';
import { Seat } from '../../types';
import {
  Eye,
  RotateCcw,
  Scale,
  LayoutGrid,
  Box,
  Volume2,
  VolumeX,
  Play,
  Lightbulb,
  Sparkles,
  Check,
  X,
  Film,
} from 'lucide-react';

interface CinemaCanvasProps {
  trailerUrl: string;
  movieTitle: string;
  seats: Seat[];
  selectedSeatIds: string[];
  onToggleSelectSeat: (seat: Seat) => void;
  activePreviewSeat: Seat | null;
  onSetActivePreviewSeat: (seat: Seat | null) => void;
}

export const CinemaCanvas: React.FC<CinemaCanvasProps> = ({
  trailerUrl,
  movieTitle,
  seats,
  selectedSeatIds,
  onToggleSelectSeat,
  activePreviewSeat,
  onSetActivePreviewSeat,
}) => {
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('BIRDS_EYE');
  const [houseLights, setHouseLights] = useState<boolean>(false);
  const [isHD, setIsHD] = useState<boolean>(true);

  // Video trailer element state
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.8);

  // Official 4K Trailer Modal
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState<boolean>(false);

  // Hover state
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);

  // Seat comparison modal state
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [comparisonSeats, setComparisonSeats] = useState<Seat[]>([]);

  // When activePreviewSeat is set from outside (e.g. sidebar), switch to SEAT_VIEW
  useEffect(() => {
    if (activePreviewSeat) {
      setCameraPreset('SEAT_VIEW');
    }
  }, [activePreviewSeat]);

  // When user clicks a seat in 3D:
  const handleSeatClick = useCallback((seat: Seat) => {
    if (seat.status === 'BOOKED' || seat.status === 'LOCKED') return;

    onSetActivePreviewSeat(seat);
    setCameraPreset('SEAT_VIEW');

    setComparisonSeats((prev) => {
      if (!prev.some((s) => s.id === seat.id)) {
        return [...prev, seat].slice(-4);
      }
      return prev;
    });
  }, [onSetActivePreviewSeat]);

  const handleReturnToBirdsEye = useCallback(() => {
    setCameraPreset('BIRDS_EYE');
    onSetActivePreviewSeat(null);
  }, [onSetActivePreviewSeat]);

  const handleToggleAudio = useCallback(() => {
    setIsMuted((prev) => !prev);
    if (isMuted && volume === 0) setVolume(0.8);
  }, [isMuted, volume]);

  const handleSeatHover = useCallback((seat: Seat | null) => {
    setHoveredSeat((prev) => (prev?.id === seat?.id ? prev : seat));
  }, []);

  return (
    <div className="relative w-full h-[65vh] sm:h-[72vh] lg:h-full min-h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#070911]">
      
      {/* 1. Top Camera View Preset Floating Pills (Matching viral reel) */}
      {viewMode === '3D' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center p-1 rounded-full bg-black/70 backdrop-blur-xl border border-white/15 shadow-2xl">
          <button
            onClick={() => {
              setCameraPreset('OVERVIEW');
              onSetActivePreviewSeat(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              cameraPreset === 'OVERVIEW'
                ? 'bg-white text-black shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => {
              setCameraPreset('FRONT_STAGE');
              onSetActivePreviewSeat(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              cameraPreset === 'FRONT_STAGE'
                ? 'bg-white text-black shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Front stage
          </button>

          <button
            onClick={() => {
              setCameraPreset('BALCONY');
              onSetActivePreviewSeat(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              cameraPreset === 'BALCONY'
                ? 'bg-white text-black shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Balcony
          </button>

          <button
            onClick={() => {
              setCameraPreset('BIRDS_EYE');
              onSetActivePreviewSeat(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
              cameraPreset === 'BIRDS_EYE'
                ? 'bg-white text-black shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>Bird's eye</span>
          </button>

          <button
            onClick={() => {
              setCameraPreset('TOUR');
              onSetActivePreviewSeat(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
              cameraPreset === 'TOUR'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md font-bold'
                : 'text-amber-400 hover:text-amber-300 hover:bg-white/10'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Tour</span>
          </button>
        </div>
      )}

      {/* 2. Top Left Action Pills: 2D/3D & Compare Seats */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setViewMode(viewMode === '3D' ? '2D' : '3D')}
          className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold text-white hover:bg-white/20 transition-all flex items-center gap-1.5 border border-white/10"
        >
          {viewMode === '3D' ? <LayoutGrid className="w-3.5 h-3.5 text-cine-cyan" /> : <Box className="w-3.5 h-3.5 text-cine-cyan" />}
          <span>{viewMode === '3D' ? '2D Map' : '3D View'}</span>
        </button>

        <button
          onClick={() => setIsComparisonOpen(true)}
          className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold text-white hover:bg-white/20 transition-all flex items-center gap-1.5 border border-white/10"
        >
          <Scale className="w-3.5 h-3.5 text-purple-400" />
          <span>Compare ({comparisonSeats.length})</span>
        </button>
      </div>

      {/* 3. Top Right Action Bar: Audio Toggle & Watch 4K Official Trailer */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Watch Official 4K Trailer Modal Trigger */}
        <button
          onClick={() => setIsTrailerModalOpen(true)}
          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all active:scale-95 border border-red-500/50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Play 4K Trailer</span>
        </button>

        {/* 3D Audio Unmute Toggle */}
        <button
          onClick={handleToggleAudio}
          className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-white/20 border border-white/10 transition-colors flex items-center gap-1.5 px-3"
          title={isMuted ? 'Unmute Trailer Audio' : 'Mute Trailer Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-cine-cyan" />}
          <span className="text-[11px] font-semibold">{isMuted ? 'Unmute' : 'Audio ON'}</span>
        </button>
      </div>

      {/* 4. Active Seated View Flight Banner & Tier Jump Bar */}
      {viewMode === '3D' && cameraPreset === 'SEAT_VIEW' && activePreviewSeat && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 px-5 py-2.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-cine-cyan/50 shadow-glow-cyan animate-fadeIn max-w-[95%]">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cine-cyan animate-pulse" />
              <span className="text-xs font-black text-white font-mono tracking-wider">
                VIEW FROM SEAT {activePreviewSeat.seatNumber}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{
                  backgroundColor: `${activePreviewSeat.category.color}30`,
                  color: activePreviewSeat.category.color,
                }}
              >
                {activePreviewSeat.category.name} • ₹{activePreviewSeat.price}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleSelectSeat(activePreviewSeat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                  selectedSeatIds.includes(activePreviewSeat.id)
                    ? 'bg-amber-500 text-black'
                    : 'bg-cine-cyan text-black hover:bg-white'
                }`}
              >
                {selectedSeatIds.includes(activePreviewSeat.id) ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Selected
                  </>
                ) : (
                  'Select Seat'
                )}
              </button>

              <button
                onClick={handleReturnToBirdsEye}
                className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset View</span>
              </button>
            </div>
          </div>

          {/* Quick Jump to Other Tiers */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1.5 border-t border-white/10 w-full text-[11px]">
            <span className="text-slate-400 text-[10px]">Test other seat types:</span>
            {['Classic', 'Prime', 'Balcony', 'Royal Recliner'].map((catName) => {
              const sampleSeat = seats.find(
                (s) => s.category.name.toLowerCase().includes(catName.toLowerCase()) && s.status !== 'BOOKED'
              );
              if (!sampleSeat) return null;
              const isCurrent = activePreviewSeat.category.name.toLowerCase().includes(catName.toLowerCase());
              return (
                <button
                  key={catName}
                  onClick={() => handleSeatClick(sampleSeat)}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    isCurrent
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {catName} ({sampleSeat.seatNumber})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Bottom Center Floating Toggles: House Lights & HD */}
      {viewMode === '3D' && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1 rounded-full bg-black/70 backdrop-blur-xl border border-white/15 shadow-2xl">
          <button
            onClick={() => setHouseLights(!houseLights)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              houseLights
                ? 'bg-amber-400 text-black font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Lightbulb className={`w-3.5 h-3.5 ${houseLights ? 'text-black fill-current' : 'text-amber-400'}`} />
            <span>House lights</span>
          </button>

          <div className="w-[1px] h-4 bg-white/20" />

          <button
            onClick={() => setIsHD(!isHD)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isHD
                ? 'bg-white/20 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            HD
          </button>
        </div>
      )}

      {/* 6. Hovered Seat Tooltip */}
      {hoveredSeat && (
        <div className="absolute bottom-16 left-6 z-20 px-3.5 py-2 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 text-xs flex items-center gap-2.5 shadow-xl pointer-events-none animate-fadeIn">
          <span className="font-mono font-bold text-white text-sm">{hoveredSeat.seatNumber}</span>
          <div className="w-[1px] h-4 bg-white/10" />
          <span
            className="font-semibold text-[11px]"
            style={{ color: hoveredSeat.category.color }}
          >
            {hoveredSeat.category.name} • ₹{hoveredSeat.price}
          </span>
          <span className="text-[10px] text-slate-400">
            {hoveredSeat.status === 'BOOKED' ? 'Unavailable' : 'Click to sit & experience view'}
          </span>
        </div>
      )}

      {/* Main 3D Canvas Rendering Stage */}
      {viewMode === '3D' ? (
        <Canvas
          shadows
          camera={{
            position: [8.5, 13.5, 9.5],
            fov: 46,
            near: 0.1,
            far: 100,
          }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          }}
        >
          {/* Virtual Auditorium Structure */}
          <CinemaAuditorium houseLights={houseLights} />

          {/* Curved Screen with Real Local Movie Trailer Stream */}
          <CinemaScreen
            trailerUrl="/videos/trailer.mp4"
            isPlaying={isPlaying}
            isMuted={isMuted}
            volume={volume}
            onVideoRefReady={setVideoElement}
          />

          {/* Physical 3D Amphitheatre Seats with Raycast Hit Detection */}
          <CinemaSeats
            seats={seats}
            selectedSeatIds={selectedSeatIds}
            activePreviewSeatId={activePreviewSeat?.id || null}
            onSeatClick={handleSeatClick}
            onSeatHover={handleSeatHover}
          />

          {/* Adaptive Camera Flight Controller with Free Orbit and Scroll Zoom */}
          <CameraController
            preset={cameraPreset}
            activeSeat={activePreviewSeat}
            onTransitionComplete={() => {}}
          />
        </Canvas>
      ) : (
        <SeatMap2DFallback
          seats={seats}
          selectedSeatIds={selectedSeatIds}
          onToggleSelectSeat={onToggleSelectSeat}
        />
      )}

      {/* Seat Comparison Modal */}
      <SeatComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        seats={comparisonSeats}
        onSelectSeat={onToggleSelectSeat}
        selectedSeatIds={selectedSeatIds}
      />

      {/* Official 4K Theatrical YouTube Trailer Modal */}
      {isTrailerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-[#0B0F19] rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col">
            <div className="p-4 bg-[#0F121C] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
                  <Film className="w-4 h-4 text-red-500" />
                  <span>{movieTitle} — Official 4K Theatrical Trailer</span>
                </h3>
              </div>
              <button
                onClick={() => setIsTrailerModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative w-full aspect-video bg-black">
              <iframe
                src="https://www.youtube.com/embed/kQDd1AhGIHk?autoplay=1&rel=0&modestbranding=1"
                title={`${movieTitle} Official Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
