import React from 'react';
import * as THREE from 'three';

interface CinemaAuditoriumProps {
  houseLights?: boolean;
}

export const CinemaAuditorium: React.FC<CinemaAuditoriumProps> = ({ houseLights = false }) => {
  // 10 tiered steps for stadium seating
  // Rows A (-4.5m) to K (+9.0m)
  const stepRisers = [
    { row: 'A', z: -4.5, y: 0.2, depth: 1.5 },
    { row: 'B', z: -3.0, y: 0.45, depth: 1.5 },
    { row: 'C', z: -1.5, y: 0.8, depth: 1.5 },
    { row: 'D', z: 0.0, y: 1.25, depth: 1.5 },
    { row: 'E', z: 1.5, y: 1.8, depth: 1.5 },
    { row: 'F', z: 3.0, y: 2.45, depth: 1.5 },
    { row: 'G', z: 4.5, y: 3.2, depth: 1.5 },
    { row: 'H', z: 6.0, y: 4.0, depth: 1.5 },
    { row: 'J', z: 7.5, y: 4.8, depth: 1.5 },
    { row: 'K', z: 9.0, y: 5.6, depth: 1.8 },
  ];

  return (
    <group>
      {/* 1. Main Base Floor - Warm rich polished timber */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[28, 0.2, 32]} />
        <meshStandardMaterial color="#22150E" roughness={0.65} metalness={0.15} />
      </mesh>

      {/* 2. Front Cinema Stage (Under the Screen) */}
      <mesh position={[0, 0.4, -9.5]} receiveShadow>
        <boxGeometry args={[22, 0.8, 4.0]} />
        <meshStandardMaterial color="#2B1A12" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Stage Front Trim & Footlight Glow */}
      <mesh position={[0, 0.05, -7.5]}>
        <boxGeometry args={[20, 0.06, 0.06]} />
        <meshBasicMaterial color="#FFB800" />
      </mesh>

      {/* 3. Red Theatrical Screen Curtains / Velvet Drapes */}
      {/* Left Curtain */}
      <group position={[-9.2, 4.2, -9.3]}>
        {[-0.8, -0.4, 0, 0.4, 0.8].map((offset, i) => (
          <mesh key={`curt-l-${i}`} position={[offset, 0, Math.sin(i * 1.5) * 0.15]}>
            <cylinderGeometry args={[0.25, 0.28, 8.5, 16]} />
            <meshStandardMaterial color="#881324" roughness={0.7} metalness={0.1} />
          </mesh>
        ))}
      </group>
      {/* Right Curtain */}
      <group position={[9.2, 4.2, -9.3]}>
        {[-0.8, -0.4, 0, 0.4, 0.8].map((offset, i) => (
          <mesh key={`curt-r-${i}`} position={[offset, 0, Math.sin(i * 1.5) * 0.15]}>
            <cylinderGeometry args={[0.25, 0.28, 8.5, 16]} />
            <meshStandardMaterial color="#881324" roughness={0.7} metalness={0.1} />
          </mesh>
        ))}
      </group>

      {/* 4. Stadium Stepped Risers with Warm Wood Tops & Row Markers */}
      {stepRisers.map((step, idx) => (
        <group key={idx}>
          {/* Step Riser Platform Body */}
          <mesh position={[0, step.y / 2, step.z]} receiveShadow>
            <boxGeometry args={[21, step.y, step.depth]} />
            <meshStandardMaterial color="#1E130D" roughness={0.75} metalness={0.1} />
          </mesh>

          {/* Stepped Tread Surface (Polished Timber Cap) */}
          <mesh position={[0, step.y + 0.01, step.z]}>
            <boxGeometry args={[21, 0.02, step.depth - 0.02]} />
            <meshStandardMaterial color="#301E15" roughness={0.5} metalness={0.1} />
          </mesh>

          {/* Left Aisle Step Tread Light */}
          <mesh position={[-3.8, step.y + 0.02, step.z + 0.6]}>
            <boxGeometry args={[0.8, 0.015, 0.08]} />
            <meshBasicMaterial color="#38BDF8" />
          </mesh>

          {/* Right Aisle Step Tread Light */}
          <mesh position={[3.8, step.y + 0.02, step.z + 0.6]}>
            <boxGeometry args={[0.8, 0.015, 0.08]} />
            <meshBasicMaterial color="#38BDF8" />
          </mesh>

          {/* Row Letter Marker Decal Blocks (A, B, C... on the aisle floor) */}
          <group position={[-3.8, step.y + 0.02, step.z - 0.3]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.45, 0.45]} />
              <meshBasicMaterial color="#0A0F1D" transparent opacity={0.7} />
            </mesh>
            {/* Illuminated Row Letter Tag */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.12, 0.16, 16]} />
              <meshBasicMaterial color="#E2E8F0" />
            </mesh>
          </group>

          <group position={[3.8, step.y + 0.02, step.z - 0.3]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.45, 0.45]} />
              <meshBasicMaterial color="#0A0F1D" transparent opacity={0.7} />
            </mesh>
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.12, 0.16, 16]} />
              <meshBasicMaterial color="#E2E8F0" />
            </mesh>
          </group>
        </group>
      ))}

      {/* 5. Left Acoustic Wall with Warm Wood Slats & Sconces */}
      <mesh position={[-11.5, 6.5, 0]}>
        <boxGeometry args={[0.4, 14, 28]} />
        <meshStandardMaterial color="#16100C" roughness={0.9} />
      </mesh>

      {/* Left Wall Warm Timber Slat Columns */}
      {[-8, -4, 0, 4, 8].map((z, i) => (
        <group key={`left-slat-${i}`} position={[-11.2, 5.5, z]}>
          <mesh>
            <boxGeometry args={[0.25, 9.5, 2.0]} />
            <meshStandardMaterial color="#3A2519" roughness={0.45} metalness={0.15} />
          </mesh>
          {/* Vertical Warm Backlight Channel */}
          <mesh position={[0.13, 0, 0]}>
            <boxGeometry args={[0.02, 9.0, 0.05]} />
            <meshBasicMaterial color="#F59E0B" />
          </mesh>
        </group>
      ))}

      {/* Left Wall Green Emergency EXIT Sign */}
      <group position={[-11.25, 3.8, -6.5]}>
        <mesh>
          <boxGeometry args={[0.1, 0.4, 0.9]} />
          <meshStandardMaterial color="#047857" emissive="#10B981" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* 6. Right Acoustic Wall with Warm Wood Slats & Sconces */}
      <mesh position={[11.5, 6.5, 0]}>
        <boxGeometry args={[0.4, 14, 28]} />
        <meshStandardMaterial color="#16100C" roughness={0.9} />
      </mesh>

      {/* Right Wall Warm Timber Slat Columns */}
      {[-8, -4, 0, 4, 8].map((z, i) => (
        <group key={`right-slat-${i}`} position={[11.2, 5.5, z]}>
          <mesh>
            <boxGeometry args={[0.25, 9.5, 2.0]} />
            <meshStandardMaterial color="#3A2519" roughness={0.45} metalness={0.15} />
          </mesh>
          <mesh position={[-0.13, 0, 0]}>
            <boxGeometry args={[0.02, 9.0, 0.05]} />
            <meshBasicMaterial color="#F59E0B" />
          </mesh>
        </group>
      ))}

      {/* Right Wall Green Emergency EXIT Sign */}
      <group position={[11.25, 3.8, -6.5]}>
        <mesh>
          <boxGeometry args={[0.1, 0.4, 0.9]} />
          <meshStandardMaterial color="#047857" emissive="#10B981" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* 7. Auditorium Rear Wall & Projector Booth */}
      <mesh position={[0, 7, 12.8]}>
        <boxGeometry args={[23, 14, 0.4]} />
        <meshStandardMaterial color="#120E0A" roughness={0.9} />
      </mesh>

      {/* Projector Booth Window */}
      <mesh position={[0, 9.5, 12.5]}>
        <boxGeometry args={[2.8, 1.2, 0.1]} />
        <meshPhysicalMaterial
          color="#38BDF8"
          roughness={0.1}
          transmission={0.8}
          thickness={0.5}
          emissive="#38BDF8"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Projector Volumetric Cone Beam */}
      <mesh position={[0, 6.8, 1.0]} rotation={[0.24, 0, 0]}>
        <coneGeometry args={[4.2, 22, 32, 1, true]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.035}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 8. Ceiling with Drop Baffles */}
      <mesh position={[0, 13, 0]}>
        <boxGeometry args={[23, 0.3, 28]} />
        <meshStandardMaterial color="#0B0907" roughness={0.95} />
      </mesh>

      {/* 9. Dynamic House Lights & Spotlights */}
      <ambientLight intensity={houseLights ? 0.75 : 0.2} color="#FFF5EA" />

      {/* Stage & Screen Wash Lights */}
      <spotLight
        position={[0, 12, 6]}
        target-position={[0, 4.2, -9.5]}
        color="#FFF1D6"
        intensity={houseLights ? 0.9 : 0.28}
        angle={0.65}
        penumbra={0.7}
      />

      {/* Wall Sconce Lighting */}
      <pointLight position={[-10.8, 5.5, 0]} intensity={houseLights ? 0.6 : 0.15} color="#F59E0B" distance={10} />
      <pointLight position={[10.8, 5.5, 0]} intensity={houseLights ? 0.6 : 0.15} color="#F59E0B" distance={10} />
    </group>
  );
};
