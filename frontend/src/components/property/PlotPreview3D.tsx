import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { resolveMediaUrl } from '../../lib/api';

const sage = '#A8B8A0';
const champagne = '#D7C5A3';
const sky1 = '#dce8dc';
const sky2 = '#c3d6c9';

function parseDimensions(dimensions: string | undefined, areaSqft: number): { width: number; depth: number } {
  if (dimensions) {
    const match = dimensions.match(/(\d+(?:\.\d+)?)\s*ft\s*x\s*(\d+(?:\.\d+)?)\s*ft/i);
    if (match) {
      return { width: parseFloat(match[1]) / 10, depth: parseFloat(match[2]) / 10 };
    }
  }
  const side = Math.sqrt(areaSqft) / 10;
  return { width: side, depth: side };
}

function PlotGround({ imageUrl, width, depth }: { imageUrl: string; width: number; depth: number }) {
  const texture = useTexture(imageUrl);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial map={texture} roughness={0.9} />
    </mesh>
  );
}

function Boundary({ width, depth }: { width: number; depth: number }) {
  const t = 0.08;
  const segments: Array<[number, number, number, number]> = [
    [0, depth / 2, width, t],
    [0, -depth / 2, width, t],
    [width / 2, 0, t, depth],
    [-width / 2, 0, t, depth],
  ];
  return (
    <>
      {segments.map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.03, z]}>
          <boxGeometry args={[w, 0.1, d]} />
          <meshStandardMaterial color={champagne} roughness={0.7} />
        </mesh>
      ))}
    </>
  );
}

function Scene({ imageUrl, width, depth }: { imageUrl: string; width: number; depth: number }) {
  const maxDim = Math.max(width, depth);
  return (
    <>
      <color attach="background" args={[sky1]} />
      <fog attach="fog" args={[sky2, maxDim * 2.5, maxDim * 6]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[maxDim, maxDim * 1.5, maxDim]} intensity={1} castShadow />
      <Suspense fallback={null}>
        <PlotGround imageUrl={imageUrl} width={width} depth={depth} />
      </Suspense>
      <Boundary width={width} depth={depth} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[maxDim * 8, maxDim * 8]} />
        <meshStandardMaterial color={sage} />
      </mesh>
      <OrbitControls
        maxPolarAngle={Math.PI / 2.2}
        minDistance={maxDim * 0.6}
        maxDistance={maxDim * 4}
        target={[0, 0, 0]}
      />
    </>
  );
}

export default function PlotPreview3D({
  image,
  dimensions,
  areaSqft,
}: {
  image: string;
  dimensions?: string;
  areaSqft: number;
}) {
  const { width, depth } = useMemo(() => parseDimensions(dimensions, areaSqft), [dimensions, areaSqft]);
  const imageUrl = resolveMediaUrl(image);
  const maxDim = Math.max(width, depth);

  return (
    <Canvas shadows camera={{ position: [maxDim * 1.4, maxDim * 1.3, maxDim * 1.4], fov: 45 }}>
      <Scene imageUrl={imageUrl} width={width} depth={depth} />
    </Canvas>
  );
}
