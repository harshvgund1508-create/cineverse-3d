import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Seat } from '../../types';

export type CameraPreset = 'OVERVIEW' | 'FRONT_STAGE' | 'BALCONY' | 'BIRDS_EYE' | 'TOUR' | 'SEAT_VIEW';

interface CameraControllerProps {
  preset: CameraPreset;
  activeSeat: Seat | null;
  onTransitionComplete?: () => void;
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  preset,
  activeSeat,
  onTransitionComplete,
}) => {
  const { camera } = useThree();
  const orbitRef = useRef<any>(null);

  // Transition parameters
  const isTransitioning = useRef<boolean>(false);
  const transitionProgress = useRef<number>(1.0);
  const transitionDuration = useRef<number>(0.9); // Snappy 0.9s transition

  const startPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(8.5, 13.5, 9.5));

  const startLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 3.5, -2.0));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(-1.0, 2.0, -3.5));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 3.5, -2.0));

  const screenCenter = new THREE.Vector3(0, 4.2, -9.5);
  const forwardVec = new THREE.Vector3();

  // Tour mode animation timer
  const tourTime = useRef<number>(0);

  useEffect(() => {
    // Record current position as start
    startPos.current.copy(camera.position);

    camera.getWorldDirection(forwardVec);
    startLookAt.current.copy(camera.position).addScaledVector(forwardVec, 8.0);

    transitionDuration.current = 0.9;
    transitionProgress.current = 0.0;
    isTransitioning.current = true;

    // Temporarily pause controls during animated camera flight
    if (orbitRef.current) {
      orbitRef.current.enabled = false;
    }

    switch (preset) {
      case 'SEAT_VIEW':
        if (activeSeat) {
          // Exact human eye height above cushion
          const eyeX = activeSeat.coordX;
          const eyeY = activeSeat.coordY + 0.82;
          const eyeZ = activeSeat.coordZ + 0.08;
          targetPos.current.set(eyeX, eyeY, eyeZ);
          targetLookAt.current.copy(screenCenter);
        }
        break;

      case 'BIRDS_EYE':
        targetPos.current.set(8.5, 13.5, 9.5);
        targetLookAt.current.set(-1.0, 2.0, -3.5);
        break;

      case 'OVERVIEW':
        targetPos.current.set(0, 7.5, 13.0);
        targetLookAt.current.set(0, 3.2, -2.0);
        break;

      case 'FRONT_STAGE':
        targetPos.current.set(0, 1.4, -4.0);
        targetLookAt.current.set(0, 4.5, -9.5);
        break;

      case 'BALCONY':
        targetPos.current.set(0, 8.0, 9.5);
        targetLookAt.current.set(0, 4.2, -9.5);
        break;

      case 'TOUR':
        tourTime.current = 0;
        targetPos.current.set(0, 5.0, 11.0);
        targetLookAt.current.set(0, 3.5, -2.0);
        break;
    }
  }, [preset, activeSeat]);

  useFrame((_, delta) => {
    if (preset === 'TOUR' && !isTransitioning.current) {
      tourTime.current += delta * 0.35;
      const t = tourTime.current;
      const radiusX = 9.0;
      const radiusZ = 10.0;
      const x = Math.sin(t) * radiusX;
      const z = Math.cos(t) * radiusZ + 2.0;
      const y = 6.0 + Math.sin(t * 2) * 2.5;

      camera.position.set(x, y, z);
      camera.lookAt(screenCenter);
      return;
    }

    if (isTransitioning.current) {
      transitionProgress.current += delta / transitionDuration.current;
      const p = Math.min(1.0, Math.max(0.0, transitionProgress.current));
      const ease = easeInOutCubic(p);

      camera.position.lerpVectors(startPos.current, targetPos.current, ease);
      currentLookAt.current.lerpVectors(startLookAt.current, targetLookAt.current, ease);
      camera.lookAt(currentLookAt.current);

      if (p >= 1.0) {
        isTransitioning.current = false;

        // Re-enable OrbitControls immediately after transition finishes!
        if (preset !== 'TOUR' && orbitRef.current) {
          orbitRef.current.target.copy(targetLookAt.current);
          orbitRef.current.enabled = true;
          orbitRef.current.update();
        }

        if (onTransitionComplete) {
          onTransitionComplete();
        }
      }
    } else if (preset !== 'TOUR' && orbitRef.current && orbitRef.current.enabled) {
      orbitRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={orbitRef}
      enabled={preset !== 'TOUR'}
      enableDamping={true}
      dampingFactor={0.08}
      rotateSpeed={0.9}
      zoomSpeed={1.2}
      panSpeed={0.9}
      minDistance={0.5}
      maxDistance={35.0}
      maxPolarAngle={Math.PI / 2 + 0.08}
    />
  );
};
