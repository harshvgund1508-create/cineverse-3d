import React, { useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Sparkles } from 'lucide-react';

interface TrailerControlsProps {
  videoElement: HTMLVideoElement | null;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleFullscreen?: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const TrailerControls: React.FC<TrailerControlsProps> = ({
  videoElement,
  isPlaying,
  isMuted,
  volume,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onToggleFullscreen,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Isolate timeupdate to TrailerControls only — prevents re-rendering CinemaCanvas!
  useEffect(() => {
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      if (videoElement.duration) {
        setProgress(videoElement.currentTime / videoElement.duration);
        setCurrentTime(videoElement.currentTime);
        setDuration(videoElement.duration);
      }
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoElement]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoElement || !videoElement.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoElement.currentTime = pos * videoElement.duration;
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-2xl">
      <div className="glass-panel px-5 py-3 rounded-2xl flex flex-col gap-2 shadow-2xl border border-white/10 backdrop-blur-xl">
        {/* Progress Bar with Click to Seek */}
        <div
          onClick={handleSeek}
          className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden relative cursor-pointer group"
        >
          <div
            className="bg-gradient-to-r from-cine-cyan via-cine-blue to-cine-violet h-full rounded-full transition-all duration-75"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>

        {/* Control Buttons & Audio */}
        <div className="flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <button
              onClick={onTogglePlay}
              className="p-2 rounded-xl bg-white/10 hover:bg-cine-cyan hover:text-black transition-colors duration-200 flex items-center gap-1.5 font-medium text-white shadow-lg"
              title={isPlaying ? 'Pause Trailer' : 'Play Trailer'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span className="text-xs font-semibold">{isPlaying ? 'Pause' : 'Play Screen Trailer'}</span>
            </button>

            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
              <button
                onClick={onToggleMute}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-cine-cyan" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-16 accent-cine-cyan h-1 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <span className="font-mono text-slate-400 text-[11px] hidden sm:inline">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cine-cyan/10 text-cine-cyan border border-cine-cyan/30 text-[11px] font-semibold tracking-wide">
              <Sparkles className="w-3 h-3 animate-spin" />
              LIVE 3D SCREEN
            </span>

            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
                title="Fullscreen Theatre"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
