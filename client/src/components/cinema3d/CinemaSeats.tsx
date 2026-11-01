import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Seat } from '../../types';

interface CinemaSeatsProps {
  seats: Seat[];
  selectedSeatIds: string[];
  activePreviewSeatId: string | null;
  onSeatClick: (seat: Seat) => void;
  onSeatHover: (seat: Seat | null) => void;
}

// 1. Shared Geometries
const pedestalGeom = new THREE.CylinderGeometry(0.06, 0.08, 0.24, 8);
const stdCushionGeom = new THREE.BoxGeometry(0.68, 0.16, 0.62);
const stdBackGeom = new THREE.BoxGeometry(0.68, 0.72, 0.14);
const recCushionGeom = new THREE.BoxGeometry(0.84, 0.18, 0.80);
const recBackGeom = new THREE.BoxGeometry(0.84, 0.90, 0.16);
const armrestGeom = new THREE.BoxGeometry(0.09, 0.08, 0.58);
const hitBoxGeom = new THREE.BoxGeometry(0.88, 1.15, 0.85);

// Shared structural materials
const pedestalMat = new THREE.MeshStandardMaterial({ color: '#1E1B18', metalness: 0.8, roughness: 0.3 });
const armrestMat = new THREE.MeshStandardMaterial({ color: '#14110E', metalness: 0.7, roughness: 0.4 });

// HITBOX MATERIAL: Must have transparent: true, opacity: 0 (NEVER visible: false, which breaks Three.js Raycaster!)
const hitBoxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });

// Floating selection beacon geometry (glowing downward pyramid / chevron matching reel)
const beaconGeom = new THREE.ConeGeometry(0.14, 0.28, 4);
beaconGeom.rotateX(Math.PI); // Point downward toward seat cushion
const beaconMat = new THREE.MeshStandardMaterial({
  color: '#00F0FF',
  emissive: '#00F0FF',
  emissiveIntensity: 1.2,
  roughness: 0.1,
  metalness: 0.3,
});

interface SingleSeatProps {
  seat: Seat;
  isSelected: boolean;
  isActivePreview: boolean;
  onSeatClick: (seat: Seat) => void;
  onSeatHover: (seat: Seat | null) => void;
}

const SingleSeat = React.memo<SingleSeatProps>(({
  seat,
  isSelected,
  isActivePreview,
  onSeatClick,
  onSeatHover,
}) => {
  const isRoyalRecliner = seat.category.name === 'Royal Recliner' || seat.category.name === 'Recliner' || seat.category.name === 'VIP';
  const cushionGeom = isRoyalRecliner ? recCushionGeom : stdCushionGeom;
  const backGeom = isRoyalRecliner ? recBackGeom : stdBackGeom;
  const seatWidth = isRoyalRecliner ? 0.84 : 0.68;
  const backHeight = isRoyalRecliner ? 0.90 : 0.72;

  // Seat orientation angled toward center of screen
  const angleY = Math.atan2(-seat.coordX, -10 - seat.coordZ) * 0.45;

  // Compute material color
  const seatMaterial = useMemo(() => {
    let color = seat.category.color;
    let emissive = '#000000';
    let emissiveIntensity = 0;

    if (seat.status === 'BOOKED') {
      color = '#334155'; // Dark slate for booked seats as seen in reel
    } else if (seat.status === 'LOCKED') {
      color = '#64748B';
    } else if (isSelected) {
      color = '#00F0FF'; // Vibrant glowing cyan for selected seats
      emissive = '#00F0FF';
      emissiveIntensity = 0.75;
    }

    if (isActivePreview) {
      color = '#00F0FF';
      emissive = '#00F0FF';
      emissiveIntensity = 1.0;
    }

    return new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity,
      roughness: isRoyalRecliner ? 0.35 : 0.6,
      metalness: 0.1,
    });
  }, [seat.category.color, seat.status, isSelected, isActivePreview, isRoyalRecliner]);

  const handlePointerAction = (e: any) => {
    e.stopPropagation();
    onSeatClick(seat);
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = seat.status === 'BOOKED' ? 'not-allowed' : 'pointer';
    onSeatHover(seat);
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
    onSeatHover(null);
  };

  return (
    <group position={[seat.coordX, seat.coordY, seat.coordZ]} rotation={[0, angleY, 0]}>
      {/* 1. Large Transparent Hit Box for 100% reliable click & raycasting */}
      <mesh
        geometry={hitBoxGeom}
        material={hitBoxMat}
        position={[0, 0.48, 0]}
        onClick={handlePointerAction}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />

      {/* Pedestal Foot */}
      <mesh geometry={pedestalGeom} material={pedestalMat} position={[0, 0.12, 0]} />

      {/* Seat Cushion (Also has click handlers as fallback) */}
      <mesh
        geometry={cushionGeom}
        material={seatMaterial}
        position={[0, 0.28, 0.02]}
        onClick={handlePointerAction}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />

      {/* Backrest (Also has click handlers as fallback) */}
      <mesh
        geometry={backGeom}
        material={seatMaterial}
        position={[0, 0.3 + backHeight / 2, -(isRoyalRecliner ? 0.8 : 0.62) / 2 + 0.04]}
        rotation={[-0.14, 0, 0]}
        onClick={handlePointerAction}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />

      {/* Left Armrest */}
      <mesh
        geometry={armrestGeom}
        material={armrestMat}
        position={[-seatWidth / 2 - 0.04, 0.38, 0]}
      />

      {/* Right Armrest */}
      <mesh
        geometry={armrestGeom}
        material={armrestMat}
        position={[seatWidth / 2 + 0.04, 0.38, 0]}
      />

      {/* Floating Glowing Cyan Indicator Arrow / Beacon above Selected Seats */}
      {(isSelected || isActivePreview) && (
        <group position={[0, 1.25, 0]}>
          <mesh geometry={beaconGeom} material={beaconMat} />
          {/* Subtle pulsating halo */}
          <mesh position={[0, 0.08, 0]}>
            <ringGeometry args={[0.08, 0.16, 16]} />
            <meshBasicMaterial color="#00F0FF" side={THREE.DoubleSide} transparent opacity={0.7} />
          </mesh>
        </group>
      )}
    </group>
  );
});

export const CinemaSeats: React.FC<CinemaSeatsProps> = ({
  seats,
  selectedSeatIds,
  activePreviewSeatId,
  onSeatClick,
  onSeatHover,
}) => {
  return (
    <group>
      {seats.map((seat) => (
        <SingleSeat
          key={seat.id}
          seat={seat}
          isSelected={selectedSeatIds.includes(seat.id)}
          isActivePreview={activePreviewSeatId === seat.id}
          onSeatClick={onSeatClick}
          onSeatHover={onSeatHover}
        />
      ))}
    </group>
  );
};
