import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { LayoutPlot } from '../../hooks/useLayoutPlots';
import { formatINR } from '../../lib/format';

const statusFill: Record<string, string> = {
  available: '#bdd1b2',
  reserved: '#e6d3a8',
  sold: '#b9b4ab',
};

const statusBorder: Record<string, string> = {
  available: '#5c8a52',
  reserved: '#b08a3e',
  sold: '#6f6a61',
};

const statusFlag: Record<string, string> = {
  available: '#4e7a4a',
  reserved: '#9c7a3f',
  sold: '#5a564e',
};

interface PlotMeshProps {
  plot: LayoutPlot;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (id: number | null) => void;
  onSelect: (plot: LayoutPlot) => void;
}

function PlotMesh({ plot, isSelected, isHovered, onHover, onSelect }: PlotMeshProps) {
  const x = plot.layout_x + plot.layout_w / 2;
  const z = plot.layout_y + plot.layout_d / 2;
  const w = plot.layout_w - 0.5;
  const d = plot.layout_d - 0.5;
  const lift = isSelected ? 0.16 : isHovered ? 0.08 : 0;
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.y += (lift - groupRef.current.position.y) * Math.min(delta * 8, 1);
  });

  const borderWidth = 0.06;

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      {/* Land parcel surface */}
      <mesh
        position={[0, 0.02, 0]}
        onPointerOver={(e) => { e.stopPropagation(); onHover(plot.id); }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => { e.stopPropagation(); onSelect(plot); }}
        receiveShadow
      >
        <boxGeometry args={[w, 0.04, d]} />
        <meshStandardMaterial
          color={statusFill[plot.status]}
          roughness={0.9}
          emissive={isSelected ? statusBorder[plot.status] : '#000000'}
          emissiveIntensity={isSelected ? 0.25 : 0}
        />
      </mesh>

      {/* Boundary fence/edge */}
      {[
        [0, d / 2 - borderWidth / 2, w, borderWidth] as const,
        [0, -d / 2 + borderWidth / 2, w, borderWidth] as const,
      ].map(([px, pz, bw, bd], i) => (
        <mesh key={`h-${i}`} position={[px, 0.05, pz]}>
          <boxGeometry args={[bw, 0.08, bd]} />
          <meshStandardMaterial color={statusBorder[plot.status]} roughness={0.7} />
        </mesh>
      ))}
      {[
        [w / 2 - borderWidth / 2, 0, borderWidth, d] as const,
        [-w / 2 + borderWidth / 2, 0, borderWidth, d] as const,
      ].map(([px, pz, bw, bd], i) => (
        <mesh key={`v-${i}`} position={[px, 0.05, pz]}>
          <boxGeometry args={[bw, 0.08, bd]} />
          <meshStandardMaterial color={statusBorder[plot.status]} roughness={0.7} />
        </mesh>
      ))}

      {/* Signpost */}
      <group position={[-w / 2 + 0.3, 0, -d / 2 + 0.3]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.6, 6]} />
          <meshStandardMaterial color="#5a4632" roughness={0.9} />
        </mesh>
        <mesh position={[0.17, 0.55, 0]}>
          <boxGeometry args={[0.34, 0.2, 0.02]} />
          <meshStandardMaterial color={statusFlag[plot.status]} roughness={0.6} />
        </mesh>
      </group>

      <Html position={[0, 0.5 + lift, 0]} center distanceFactor={11} style={{ pointerEvents: 'none' }}>
        <span
          className="whitespace-nowrap rounded-full bg-ivory/95 px-2 py-0.5 text-[11px] font-semibold text-charcoal shadow-sm"
        >
          {plot.plot_number}
        </span>
      </Html>

      {isHovered && !isSelected && (
        <Html position={[0, 1.1, 0]} center distanceFactor={11} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-lg bg-charcoal/95 px-3 py-2 text-xs text-ivory shadow-lg">
            <p className="font-semibold">{plot.plot_number}</p>
            <p>{plot.area_sqft.toLocaleString('en-IN')} sq.ft. · {formatINR(plot.price)}</p>
            <p className="capitalize text-ivory/70">{plot.status}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function rand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function Ground({ width, depth }: { width: number; depth: number }) {
  const patches = useMemo(() => {
    const arr: Array<{ x: number; z: number; r: number; opacity: number }> = [];
    for (let i = 0; i < 24; i++) {
      arr.push({
        x: rand(i * 3.3) * (width + 20) - 10,
        z: rand(i * 5.1) * (depth + 20) - 10,
        r: 1.5 + rand(i * 7.7) * 3,
        opacity: 0.04 + rand(i * 2.2) * 0.05,
      });
    }
    return arr;
  }, [width, depth]);

  return (
    <group>
      <mesh position={[width / 2, -0.03, depth / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width + 24, depth + 24]} />
        <meshStandardMaterial color="#aebf9c" roughness={1} />
      </mesh>
      {patches.map((p, i) => (
        <mesh key={i} position={[p.x, -0.025, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[p.r, 10]} />
          <meshStandardMaterial color="#8fa77e" transparent opacity={p.opacity} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Road({ x, z, length, width, horizontal }: { x: number; z: number; length: number; width: number; horizontal: boolean }) {
  const dashCount = Math.floor(length / 1.1);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={horizontal ? [length, width] : [width, length]} />
        <meshStandardMaterial color="#4b4a46" roughness={0.95} />
      </mesh>
      {Array.from({ length: dashCount }).map((_, i) => {
        const offset = -length / 2 + 0.55 + i * 1.1;
        return (
          <mesh
            key={i}
            position={horizontal ? [offset, 0.015, 0] : [0, 0.015, offset]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={horizontal ? [0.5, 0.06] : [0.06, 0.5]} />
            <meshBasicMaterial color="#e8dfc8" />
          </mesh>
        );
      })}
    </group>
  );
}

function Roads({ plots, width, depth }: { plots: LayoutPlot[]; width: number; depth: number }) {
  const rows = useMemo(() => Array.from(new Set(plots.map((p) => p.layout_y))).sort((a, b) => a - b), [plots]);
  return (
    <>
      {rows.map((y, i) => (
        <Road key={`road-${i}`} x={width / 2} z={y - 1} length={width} width={1.7} horizontal />
      ))}
      <Road x={-1} z={depth / 2} length={depth + 2} width={1.7} horizontal={false} />
    </>
  );
}

function Tree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.5, 6]} />
        <meshStandardMaterial color="#4a3a28" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshStandardMaterial color="#5e7a4a" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Trees({ width, depth }: { width: number; depth: number }) {
  const trees = useMemo(() => {
    const arr: Array<{ x: number; z: number }> = [];
    const perimeter = Math.floor((width + depth) / 2.2);
    for (let i = 0; i < perimeter; i++) {
      const t = i / perimeter;
      if (t < 0.25) arr.push({ x: t * 4 * width, z: -1.8 });
      else if (t < 0.5) arr.push({ x: width + 1.2, z: (t - 0.25) * 4 * depth });
      else if (t < 0.75) arr.push({ x: width - (t - 0.5) * 4 * width, z: depth + 1.2 });
      else arr.push({ x: -1.8, z: depth - (t - 0.75) * 4 * depth });
    }
    return arr.filter((_, i) => i % 2 === 0);
  }, [width, depth]);

  return (
    <>
      {trees.map((t, i) => (
        <Tree key={i} x={t.x} z={t.z} />
      ))}
    </>
  );
}

export default function PlotScene3D({
  plots,
  onSelect,
  selectedId,
  autoRotate = false,
}: {
  plots: LayoutPlot[];
  onSelect: (plot: LayoutPlot) => void;
  selectedId: number | null;
  autoRotate?: boolean;
}) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const bounds = useMemo(() => {
    const maxX = Math.max(...plots.map((p) => p.layout_x + p.layout_w), 10);
    const maxZ = Math.max(...plots.map((p) => p.layout_y + p.layout_d), 10);
    return { width: maxX, depth: maxZ };
  }, [plots]);

  const camDistance = Math.max(bounds.width, bounds.depth) * 1.1;

  return (
    <Canvas shadows camera={{ position: [bounds.width / 2, camDistance * 0.72, bounds.depth + camDistance * 0.55], fov: 42 }}>
      <Suspense fallback={null}>
        <color attach="background" args={['#dfe3d4']} />
        <fog attach="fog" args={['#dfe3d4', camDistance * 1.6, camDistance * 3.2]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[14, 22, 10]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-10, 10, -6]} intensity={0.25} color="#A8B8A0" />
        <Ground width={bounds.width} depth={bounds.depth} />
        <Roads plots={plots} width={bounds.width} depth={bounds.depth} />
        <Trees width={bounds.width} depth={bounds.depth} />
        {plots.map((plot) => (
          <PlotMesh
            key={plot.id}
            plot={plot}
            isSelected={selectedId === plot.id}
            isHovered={hoveredId === plot.id}
            onHover={setHoveredId}
            onSelect={onSelect}
          />
        ))}
        <OrbitControls
          target={[bounds.width / 2, 0, bounds.depth / 2]}
          maxPolarAngle={Math.PI / 2.3}
          minDistance={Math.max(camDistance * 0.3, 5)}
          maxDistance={camDistance * 2.5}
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
        />
      </Suspense>
    </Canvas>
  );
}
