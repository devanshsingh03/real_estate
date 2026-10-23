import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, MapPin, Search } from 'lucide-react';
import SearchPanel from './SearchPanel';
import { useWebGLSupport } from '../../hooks/useWebGLSupport';

const HeroScene3D = lazy(() => import('./HeroScene3D'));

const markers = [
  { top: '22%', side: 'left' as const, offset: '4%', label: 'Bargawan, Katni' },
  { top: '70%', side: 'left' as const, offset: '7%', label: 'Madhav Nagar, Katni' },
  { top: '28%', side: 'right' as const, offset: '4%', label: 'Sleemanabad, Katni' },
  { top: '72%', side: 'right' as const, offset: '6%', label: 'Barhi, Katni' },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const reduceMotion = useReducedMotion();
  const webglSupported = useWebGLSupport();
  const [sceneReady, setSceneReady] = useState(false);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const vignetteOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.35]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  useEffect(() => {
    if (reduceMotion) return;
    function handleMove(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setParallax({ x, y });
    }
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [reduceMotion]);

  return (
    <section ref={containerRef} className="relative flex min-h-screen flex-col overflow-hidden bg-forest pt-24">
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{ transform: reduceMotion ? undefined : `translate(${parallax.x * -10}px, ${parallax.y * -6}px) scale(1.08)` }}
      >
        <div
          className="h-full w-full"
          style={{
            background:
              'radial-gradient(circle at 25% 20%, rgba(168,184,160,0.35), transparent 45%), radial-gradient(circle at 75% 60%, rgba(215,197,163,0.25), transparent 50%), linear-gradient(160deg, #0c211c 0%, #102B25 45%, #1a3a30 100%)',
          }}
        />
      </div>

      {webglSupported && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: sceneReady ? 1 : 0 }}
        >
          <Suspense fallback={null}>
            <HeroScene3D
              mouse={reduceMotion ? { x: 0, y: 0 } : parallax}
              onReady={() => setSceneReady(true)}
              scrollProgress={reduceMotion ? undefined : scrollYProgress}
            />
          </Suspense>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest via-forest/10 to-forest/55" />
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: vignetteOpacity,
          background:
            'radial-gradient(ellipse 60% 55% at 50% 42%, rgba(12,33,28,0.82) 0%, rgba(12,33,28,0.55) 45%, transparent 75%)',
        }}
      />

      {markers.map((m, i) => (
        <motion.div
          key={m.label}
          className="absolute z-10 hidden items-center gap-1.5 whitespace-nowrap rounded-full bg-ivory/90 px-3 py-1.5 text-xs font-medium text-forest shadow-lg lg:flex"
          style={{ top: m.top, [m.side]: m.offset }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: [0, -6, 0] }}
          transition={{ delay: 0.8 + i * 0.15, duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <MapPin size={12} className="text-sage" />
          {m.label}
        </motion.div>
      ))}

      <motion.div
        className="relative z-20 mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center px-6 text-center"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 rounded-full border border-champagne/40 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-champagne"
        >
          Curated Plots · Verified Listings
        </motion.p>

        <h1 className="font-display text-5xl font-semibold leading-[1.1] text-ivory sm:text-6xl lg:text-7xl">
          {['Find Your Ground.', 'Build Your Future.'].map((line, i) => (
            <motion.span
              key={line}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-ivory/70 sm:text-lg"
        >
          Discover exceptional plots in promising locations. Explore the land, understand the details, and take the next step toward owning your future.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/plots"
            className="group flex items-center gap-2 rounded-full bg-champagne px-7 py-3.5 text-sm font-semibold text-forest transition-transform duration-250 hover:scale-105"
          >
            <Search size={16} /> Explore Plots
          </Link>
          <Link
            to="/list-your-plot"
            className="flex items-center gap-2 rounded-full border border-ivory/30 px-7 py-3.5 text-sm font-semibold text-ivory transition-colors duration-250 hover:bg-ivory/10"
          >
            List Your Property <ArrowRight size={16} />
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        style={{ opacity: contentOpacity }}
        className="relative z-20 mx-auto w-full max-w-4xl px-6 pb-10"
      >
        <SearchPanel />
      </motion.div>

      <motion.div
        style={{ opacity: scrollHintOpacity }}
        className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1 text-ivory/50"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.2em]">Scroll</span>
          <ChevronDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}
