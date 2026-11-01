import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Play, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface CinemaScreenProps {
  trailerUrl?: string;
  isPlaying?: boolean;
  isMuted?: boolean;
  volume?: number;
  onVideoLoaded?: () => void;
  onPlayStateChange?: (playing: boolean) => void;
  onVideoRefReady?: (video: HTMLVideoElement) => void;
}

export const CinemaScreen: React.FC<CinemaScreenProps> = ({
  trailerUrl,
  isPlaying = true,
  isMuted = true,
  volume = 0.8,
  onVideoLoaded,
  onPlayStateChange,
  onVideoRefReady,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Initialize and mount real local MP4 video
  useEffect(() => {
    const video = document.createElement('video');
    // Use local high-definition trailer video (guaranteed 200 OK, zero CORS, zero 403)
    video.src = '/videos/trailer.mp4';
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    // Always start muted to satisfy browser autoplay security policy
    video.muted = isMuted;
    video.volume = volume;
    video.preload = 'auto';

    video.onplay = () => {
      setVideoPlaying(true);
      setHasStarted(true);
    };
    video.onpause = () => setVideoPlaying(false);

    const handleLoadedData = () => {
      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBAFormat;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = false;
      setVideoTexture(texture);

      if (onVideoLoaded) onVideoLoaded();
      if (onVideoRefReady) onVideoRefReady(video);

      // Trigger autoplay
      video.play().then(() => {
        setVideoPlaying(true);
        setHasStarted(true);
      }).catch((err) => {
        console.log('Browser waiting for first click to play video:', err);
      });
    };

    video.addEventListener('loadeddata', handleLoadedData);
    videoRef.current = video;

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.pause();
      video.removeAttribute('src');
      video.load();
      if (videoTexture) videoTexture.dispose();
    };
  }, []);

  // Update video mute & volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = volume;
    }
  }, [isMuted, volume]);

  // Update play state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(console.warn);
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Continuously push video frame buffer into WebGL texture
  useFrame(() => {
    if (videoTexture && videoRef.current && !videoRef.current.paused) {
      videoTexture.needsUpdate = true;
    }
  });

  // Clicking anywhere on the 3D screen toggles play / unmutes
  const handleScreenClick = (e: any) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setVideoPlaying(true);
        if (onPlayStateChange) onPlayStateChange(true);
      }).catch(console.warn);
    } else {
      video.pause();
      setVideoPlaying(false);
      if (onPlayStateChange) onPlayStateChange(false);
    }
  };

  return (
    <group position={[0, 4.2, -10.0]}>
      {/* 1. Curved Screen Frame Bezel */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[18.4, 8.4, 0.1]} />
        <meshStandardMaterial color="#0A0D14" roughness={0.7} metalness={0.6} />
      </mesh>

      {/* 2. Screen Accent Border */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[18.15, 8.15, 0.04]} />
        <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* 3. Real Theatrical Movie Screen with Live WebGL VideoTexture */}
      <mesh
        position={[0, 0, 0.01]}
        onClick={handleScreenClick}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <planeGeometry args={[18.0, 8.0]} />
        {videoTexture ? (
          <meshBasicMaterial map={videoTexture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#1E1610" roughness={0.5} />
        )}
      </mesh>

      {/* 4. Dynamic Cinema Screen Ambient Glow onto Stage & Aisles */}
      <pointLight
        position={[0, 0, 3.2]}
        color="#F59E0B"
        intensity={videoPlaying ? 1.5 : 0.4}
        distance={28}
        decay={2}
      />

      {/* 5. Screen Stage Header Trim */}
      <mesh position={[0, 4.35, 0]}>
        <boxGeometry args={[18.4, 0.3, 0.15]} />
        <meshStandardMaterial color="#05070D" roughness={0.8} />
      </mesh>
    </group>
  );
};
