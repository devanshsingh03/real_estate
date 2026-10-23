import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import * as THREE from 'three';

const forest = '#102B25';
const forestDeep = '#0a1f1a';
const sage = '#A8B8A0';
const champagne = '#D7C5A3';
const glassBase = '#1c3a33';
const glassBase2 = '#24433a';

function rand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function createGlassTexture(seed: number, litRatio: number, cols: number, rows: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, glassBase2);
  grad.addColorStop(1, glassBase);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;
  const pad = 1.5;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = rand(seed + r * cols + c * 3.7) < litRatio;
      ctx.fillStyle = lit ? 'rgba(215,197,163,0.85)' : 'rgba(168,184,160,0.08)';
      ctx.fillRect(c * cellW + pad, r * cellH + pad, cellW - pad * 2, cellH - pad * 2);
      if (lit) {
        ctx.shadowColor = 'rgba(215,197,163,0.9)';
        ctx.shadowBlur = 6;
        ctx.fillRect(c * cellW + pad, r * cellH + pad, cellW - pad * 2, cellH - pad * 2);
        ctx.shadowBlur = 0;
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

interface BuildingData {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  litRatio: number;
  hasSpire: boolean;
}

function generateBuildings(count: number, cols: number): BuildingData[] {
  const buildings: BuildingData[] = [];
  const spacing = 1.75;
  const heroIndices = new Set([2, 9, 16, 23]);
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const isHero = heroIndices.has(i);
    const h = isHero ? 6.5 + rand(i * 13.7) * 2.5 : 1.4 + rand(i * 13.7) * 4.4;
    buildings.push({
      x: (col - cols / 2) * spacing + (rand(i * 3.1) - 0.5) * 0.3,
      z: row * spacing * -1,
      w: isHero ? 0.9 + rand(i * 7.3) * 0.2 : 0.55 + rand(i * 7.3) * 0.35,
      d: isHero ? 0.9 + rand(i * 11.9) * 0.2 : 0.55 + rand(i * 11.9) * 0.35,
      h,
      litRatio: 0.25 + rand(i * 9.1) * 0.5,
      hasSpire: isHero,
    });
  }
  return buildings;
}

function Building({ data }: { data: BuildingData }) {
  const rows = Math.max(6, Math.round(data.h * 5));
  const cols = data.w > 0.8 ? 4 : 3;
  const texture = useMemo(
    () => createGlassTexture(data.x * 31 + data.z * 17, data.litRatio, cols, rows),
    [data.x, data.z, data.litRatio, cols, rows]
  );

  return (
    <group position={[data.x, data.h / 2, data.z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[data.w, data.h, data.d]} />
        <meshPhysicalMaterial
          map={texture}
          emissiveMap={texture}
          emissive={champagne}
          emissiveIntensity={0.45}
          roughness={0.25}
          metalness={0.35}
          clearcoat={0.4}
          clearcoatRoughness={0.3}
        />
      </mesh>
      {data.hasSpire && (
        <mesh position={[0, data.h / 2 + 0.35, 0]}>
          <cylinderGeometry args={[0.015, 0.03, 0.7, 6]} />
          <meshStandardMaterial color={forestDeep} roughness={0.6} metalness={0.5} />
        </mesh>
      )}
    </group>
  );
}

function GroundGrid({ size }: { size: number }) {
  const lines = useMemo(() => {
    const step = 1.75;
    const count = Math.floor(size / step);
    const arr: Array<{ pos: [number, number, number]; rot: boolean }> = [];
    for (let i = -count; i <= count; i++) {
      arr.push({ pos: [i * step, 0.005, 0], rot: false });
      arr.push({ pos: [0, 0.005, i * step], rot: true });
    }
    return arr;
  }, [size]);

  return (
    <>
      {lines.map((l, i) => (
        <mesh key={i} position={l.pos} rotation={[-Math.PI / 2, 0, l.rot ? Math.PI / 2 : 0]}>
          <planeGeometry args={[size * 2, 0.015]} />
          <meshBasicMaterial color={sage} transparent opacity={0.1} />
        </mesh>
      ))}
    </>
  );
}

function Stars({ count = 140 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand(i * 2.1) - 0.5) * 50;
      arr[i * 3 + 1] = 6 + rand(i * 3.3) * 16;
      arr[i * 3 + 2] = -5 - rand(i * 4.7) * 30;
    }
    return arr;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={champagne} size={0.045} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function CameraRig({ scrollProgress }: { scrollProgress?: MotionValue<number> }) {
  const { camera } = useThree();
  useFrame(() => {
    const p = scrollProgress ? scrollProgress.get() : 0;
    camera.position.z = THREE.MathUtils.lerp(10, 6, p);
    camera.position.y = THREE.MathUtils.lerp(2.6, 4.4, p);
    camera.lookAt(0, THREE.MathUtils.lerp(1.2, -0.4, p), -3);
  });
  return null;
}

function Scene({ mouse, scrollProgress }: { mouse: { x: number; y: number }; scrollProgress?: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const buildings = useMemo(() => generateBuildings(42, 8), []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const scrollY = scrollProgress ? scrollProgress.get() : 0;
    const targetY = mouse.x * 0.28 + state.clock.elapsedTime * 0.015 + scrollY * 0.45;
    const targetX = mouse.y * 0.06;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * Math.min(delta * 2, 1);
    groupRef.current.rotation.x += (-targetX - groupRef.current.rotation.x) * Math.min(delta * 2, 1);
    groupRef.current.position.z = THREE.MathUtils.lerp(-2, 2, scrollY);
  });

  return (
    <>
      <fog attach="fog" args={[forest, 7, 19]} />
      <ambientLight intensity={0.4} color={sage} />
      <directionalLight position={[6, 12, 4]} intensity={0.7} color={champagne} />
      <directionalLight position={[-6, 4, -4]} intensity={0.25} color={sage} />
      <Stars />
      <CameraRig scrollProgress={scrollProgress} />
      <group ref={groupRef} position={[0, -1.5, -2]}>
        {buildings.map((b, i) => (
          <Building key={i} data={b} />
        ))}
        <GroundGrid size={18} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -3]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color={forest} />
        </mesh>
      </group>
    </>
  );
}

export default function HeroScene3D({
  mouse,
  onReady,
  scrollProgress,
}: {
  mouse: { x: number; y: number };
  onReady?: () => void;
  scrollProgress?: MotionValue<number>;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 2.6, 10], fov: 42 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: forest }}
      onCreated={() => onReady?.()}
    >
      <Scene mouse={mouse} scrollProgress={scrollProgress} />
    </Canvas>
  );
}
