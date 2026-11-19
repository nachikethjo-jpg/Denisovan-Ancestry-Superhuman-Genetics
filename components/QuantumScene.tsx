/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Stars, Html, Torus, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// 1. DNA Double Helix Scene
const DnaHelix = ({ hoverBase, setHoverBase }: { hoverBase: string | null; setHoverBase: (base: string | null) => void }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Rotate the helix slowly
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  const numRungs = 24;
  const radius = 1.5;
  const twistFrequency = 0.6; // Twist speed along Y axis
  const heightMultiplier = 0.3; // Distance between rungs

  const bases = [
    { name: 'Adenine (A)', color: '#10B981', pair: 'Thymine (T)' }, // Green
    { name: 'Thymine (T)', color: '#FBBF24', pair: 'Adenine (A)' }, // Yellow
    { name: 'Cytosine (C)', color: '#EF4444', pair: 'Guanine (G)' }, // Red
    { name: 'Guanine (G)', color: '#3B82F6', pair: 'Cytosine (C)' }  // Blue
  ];

  return (
    <group ref={groupRef}>
      {Array.from({ length: numRungs }).map((_, i) => {
        const y = (i - numRungs / 2) * heightMultiplier;
        const angle = i * twistFrequency;
        
        // Strand A position
        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        
        // Strand B position (opposite side)
        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;

        // Base pair choice
        const baseIndex = i % bases.length;
        const base = bases[baseIndex];

        return (
          <group key={i}>
            {/* Phosphate Backbone Node A */}
            <mesh position={[x1, y, z1]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#C5A059" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Phosphate Backbone Node B */}
            <mesh position={[x2, y, z2]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#C5A059" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Rung half A */}
            <mesh 
              position={[x1 / 2, y, z1 / 2]} 
              rotation={[0, -angle, 0]} 
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoverBase(`Base: ${base.name} paired with ${base.pair}`);
              }}
              onPointerOut={() => setHoverBase(null)}
            >
              <cylinderGeometry args={[0.04, 0.04, radius, 8]} />
              <meshStandardMaterial color={base.color} emissive={base.color} emissiveIntensity={0.2} roughness={0.3} />
            </mesh>

            {/* Rung half B */}
            <mesh 
              position={[x2 / 2, y, z2 / 2]} 
              rotation={[0, -angle, 0]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoverBase(`Base: ${base.pair} paired with ${base.name}`);
              }}
              onPointerOut={() => setHoverBase(null)}
            >
              <cylinderGeometry args={[0.04, 0.04, radius, 8]} />
              <meshStandardMaterial color={bases[(baseIndex + 2) % bases.length].color} emissive={bases[(baseIndex + 2) % bases.length].color} emissiveIntensity={0.2} roughness={0.3} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export const DnaHelixScene: React.FC = () => {
  const [hoverBase, setHoverBase] = useState<string | null>(null);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#F9F8F4" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#C5A059" />
        <spotLight position={[0, 10, 0]} intensity={1} angle={0.6} penumbra={1} color="#FFF" />
        
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
          <DnaHelix hoverBase={hoverBase} setHoverBase={setHoverBase} />
        </Float>
        
        <Stars radius={60} depth={30} count={600} factor={4} saturation={0.5} fade speed={1.5} />
        <OrbitControls enableZoom={false} autoRotate={false} />
      </Canvas>
      
      {/* Dynamic Base Tooltip overlay */}
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-10">
        <div className="inline-block bg-stone-900/90 text-white text-xs font-mono px-3 py-1.5 rounded-full border border-stone-700/50 backdrop-blur-sm transition-all duration-200">
          {hoverBase ? hoverBase : "Drag to rotate • Hover base rungs to analyze"}
        </div>
      </div>
    </div>
  );
};

// 2. Spleen Oxygen Tank Simulation Scene
const RedBloodCells = ({ speedMultiplier }: { speedMultiplier: number }) => {
  const count = 40;
  const meshRef = useRef<THREE.Group>(null);
  const cells = useRef<Array<{ pos: [number, number, number]; rSpeed: number; ySpeed: number; size: number }>>(
    Array.from({ length: count }).map(() => ({
      pos: [
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 2
      ],
      rSpeed: Math.random() * 2 + 0.5,
      ySpeed: Math.random() * 0.4 + 0.2,
      size: Math.random() * 0.08 + 0.04
    }))
  );

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.children.forEach((child, idx) => {
        const data = cells.current[idx];
        if (data) {
          // Flow downwards
          child.position.y -= data.ySpeed * delta * speedMultiplier * 2.5;
          child.rotation.x += data.rSpeed * delta;
          child.rotation.y += data.rSpeed * 0.5 * delta;

          // Wrap around if exit bottom
          if (child.position.y < -2.5) {
            child.position.y = 2.5;
            child.position.x = (Math.random() - 0.5) * 4;
          }
        }
      });
    }
  });

  return (
    <group ref={meshRef}>
      {cells.current.map((cell, i) => (
        <group key={i} position={cell.pos}>
          {/* Flat disk representation of a red blood cell (Torus/Cylinder) */}
          <mesh>
            <cylinderGeometry args={[cell.size, cell.size, cell.size * 0.4, 12]} />
            <meshStandardMaterial color="#EF4444" roughness={0.1} metalness={0.1} emissive="#991B1B" emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const SpleenScubaScene: React.FC<{ diveDepth: number }> = ({ diveDepth }) => {
  const contractionScale = 1 - (diveDepth / 250) * 0.45;
  const speedMultiplier = 1 + (diveDepth / 250) * 2.5; // Blood cells rush faster with oxygen flow

  return (
    <div className="w-full h-full relative bg-stone-950 rounded-xl overflow-hidden border border-stone-800">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <spotLight position={[5, 10, 5]} angle={0.4} penumbra={1} intensity={2} color="#EF4444" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#3B82F6" />
        <directionalLight position={[0, 0, 5]} intensity={0.4} />

        {/* Floating blood cells background */}
        <RedBloodCells speedMultiplier={speedMultiplier} />

        <SpleenSimulation 
          diveDepth={diveDepth} 
          contractionScale={contractionScale} 
        />

        <Stars radius={30} depth={20} count={100} factor={1} fade speed={1} />
      </Canvas>

      <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded border border-stone-800 text-[11px] font-mono text-stone-300">
        <div>SPLEEN CONTRACTION: <span className="text-red-400 font-bold">{Math.round((1 - contractionScale) * 100)}%</span></div>
        <div>OXYGEN RESERVES FLOW: <span className="text-red-400 font-bold">x{speedMultiplier.toFixed(1)}</span></div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none text-[10px] text-stone-500 font-mono">
        3D Biological Simulation of Spleen Contraction & Erythrocyte Discharge
      </div>
    </div>
  );
};

// Spleen Inner Component to use useFrame safely inside Canvas
const SpleenSimulation = ({ diveDepth, contractionScale }: { diveDepth: number; contractionScale: number }) => {
  const organRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (organRef.current) {
      const t = state.clock.getElapsedTime();
      // Pulsating beat
      const pulse = 1 + Math.sin(t * (1 + (diveDepth / 250) * 2)) * 0.04;
      organRef.current.scale.set(
        contractionScale * pulse * 1.3,
        contractionScale * pulse * 1.8,
        contractionScale * pulse * 1.0
      );
      organRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
    }
  });

  return (
    <mesh ref={organRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.7, 32, 32]} />
      <meshStandardMaterial 
        color="#991B1B" 
        roughness={0.6} 
        metalness={0.1} 
        bumpScale={0.1}
      />
    </mesh>
  );
};

// 3. Himalayan Altitude Simulation Scene
export const HimalayanAltitudeScene: React.FC<{ altitude: number; isTibetan: boolean }> = ({ altitude, isTibetan }) => {
  // High altitude = thinner oxygen. At 20,000 feet, oxygen level is ~40% of sea level.
  const oxygenDensity = Math.max(10, Math.round(100 - (altitude / 20000) * 70));
  const particleCount = oxygenDensity;

  // Simulate red blood cell thickness (blood viscosity)
  // For standard people, altitude increases red blood cells, causing dangerous thickening.
  // For Tibetans, blood remains normal, thin, and uses oxygen highly efficiently.
  const bloodViscosity = isTibetan 
    ? 1.0 // Normal / healthy
    : 1.0 + (altitude / 20000) * 1.5; // Thickens heavily!

  return (
    <div className="w-full h-full relative bg-slate-950 rounded-xl overflow-hidden border border-stone-800">
      <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#C5A059" />
        <spotLight position={[0, 10, 0]} intensity={1.5} angle={0.6} penumbra={1} color="#3B82F6" />
        <directionalLight position={[0, -5, -5]} intensity={0.5} />

        <HimalayanSimulation particleCount={particleCount} />

        <Stars radius={40} depth={25} count={300} factor={1.5} fade speed={1} />
      </Canvas>

      <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded border border-stone-800 text-[11px] font-mono text-stone-300">
        <div>AIR OXYGEN LEVEL: <span className="text-blue-400 font-bold">{Math.round(oxygenDensity)}%</span></div>
        <div>BLOOD VISCOSITY: <span className={`font-bold ${bloodViscosity > 1.8 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
          {bloodViscosity === 1.0 ? "Normal & Thin (1.0x)" : `${bloodViscosity.toFixed(2)}x (Thickened!)`}
        </span></div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none text-[10px] text-stone-500 font-mono">
        3D Environment: Altitude & Hemoglobin Viscosity Balance Simulation
      </div>
    </div>
  );
};

// Himalayan Inner Component to use useFrame safely inside Canvas
const HimalayanSimulation = ({ particleCount }: { particleCount: number }) => {
  const peakGroupRef = useRef<THREE.Group>(null);
  const oxygenRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (peakGroupRef.current) {
      peakGroupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
    if (oxygenRef.current) {
      // Oxygen particles float erratically
      oxygenRef.current.children.forEach((child, i) => {
        child.position.y += Math.sin(state.clock.getElapsedTime() + i) * 0.005;
        child.position.x += Math.cos(state.clock.getElapsedTime() + i) * 0.005;
      });
    }
  });

  return (
    <>
      {/* 3D Himalayan Peak Simulation */}
      <group ref={peakGroupRef} position={[0, -0.5, 0]}>
        {/* Base Peak */}
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[2.5, 2, 4]} />
          <meshStandardMaterial color="#475569" roughness={0.9} flatShading />
        </mesh>
        {/* Snowy Cap */}
        <mesh position={[0, 0.6, 0]}>
          <coneGeometry args={[1.0, 0.8, 4]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.5} flatShading />
        </mesh>
        {/* Secondary Peak */}
        <mesh position={[1.5, -0.3, -1.2]}>
          <coneGeometry args={[1.5, 1.4, 4]} />
          <meshStandardMaterial color="#334155" roughness={0.9} flatShading />
        </mesh>
      </group>

      {/* Floating Oxygen Molecules (Blue spheres) */}
      <group ref={oxygenRef}>
        {Array.from({ length: 40 }).map((_, i) => {
          // Only show up to particleCount
          if (i >= particleCount) return null;
          const x = Math.sin(i * 123.45) * 2;
          const y = Math.cos(i * 678.90) * 1.5 + 1.2;
          const z = Math.sin(i * 987.65) * 1.5;
          return (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color="#60A5FA" transparent opacity={0.7} />
            </mesh>
          );
        })}
      </group>
    </>
  );
};
