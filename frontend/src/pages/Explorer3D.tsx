import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Box, Grid3x3, Loader2, MousePointer2, ZoomIn, MousePointerClick } from 'lucide-react';
import { useLayoutPlots, useProjectList, type LayoutPlot } from '../hooks/useLayoutPlots';
import { useWebGLSupport } from '../hooks/useWebGLSupport';
import PlotDetailPanel from '../components/explorer/PlotDetailPanel';
import { formatINR, formatArea, statusColors, statusLabels } from '../lib/format';

const ONBOARD_KEY = 'explorer3d_onboarded';

const PlotScene3D = lazy(() => import('../components/explorer/PlotScene3D'));
const PlotScene2D = lazy(() => import('../components/explorer/PlotScene2D'));

const legendItems = [
  { status: 'available', color: 'bg-sage' },
  { status: 'reserved', color: 'bg-champagne' },
  { status: 'sold', color: 'bg-charcoal/40' },
];

export default function Explorer3D() {
  const projects = useProjectList();
  const [project, setProject] = useState('');
  const webglSupported = useWebGLSupport();
  const [mode, setMode] = useState<'3d' | '2d'>('3d');
  const [selected, setSelected] = useState<LayoutPlot | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (projects.length && !project) setProject(projects[0]);
  }, [projects, project]);

  useEffect(() => {
    if (!webglSupported) setMode('2d');
  }, [webglSupported]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.localStorage.getItem(ONBOARD_KEY)) setShowOnboarding(true);
  }, []);

  function dismissOnboarding() {
    setShowOnboarding(false);
    window.localStorage.setItem(ONBOARD_KEY, '1');
  }

  const { data: plots, loading } = useLayoutPlots(project);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-32 lg:px-10">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sage">Signature Feature</p>
        <h1 className="font-display text-4xl font-semibold text-forest sm:text-5xl">Interactive 3D Plot Explorer</h1>
        <p className="mt-3 text-charcoal/60">
          This is an illustrative sample layout generated from listing data, not a legally surveyed site plan — a working
          preview of how buyers could walk a real layout plot by plot.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-forest/10 bg-sage/10 px-4 py-3 text-sm text-charcoal/70">
        <span className="flex items-center gap-1.5"><MousePointer2 size={15} className="text-forest" /> Drag to rotate the layout</span>
        <span className="flex items-center gap-1.5"><ZoomIn size={15} className="text-forest" /> Scroll or pinch to zoom</span>
        <span className="flex items-center gap-1.5"><MousePointerClick size={15} className="text-forest" /> Click any colored plot for its details</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <select
          value={project}
          onChange={(e) => { setProject(e.target.value); setSelected(null); }}
          className="rounded-full border border-forest/20 bg-white px-4 py-2 text-sm outline-none"
        >
          {projects.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setResetKey((k) => k + 1)}
            className="flex items-center gap-1.5 rounded-full border border-forest/20 px-3.5 py-2 text-sm"
          >
            <RotateCcw size={14} /> Reset View
          </button>
          {webglSupported && (
            <div className="flex items-center gap-1 rounded-full border border-forest/20 p-1">
              <button
                onClick={() => setMode('3d')}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${mode === '3d' ? 'bg-forest text-ivory' : 'text-charcoal/60'}`}
              >
                <Box size={13} /> 3D
              </button>
              <button
                onClick={() => setMode('2d')}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${mode === '2d' ? 'bg-forest text-ivory' : 'text-charcoal/60'}`}
              >
                <Grid3x3 size={13} /> 2D
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div
            className="relative h-[480px] overflow-hidden rounded-2xl border border-forest/10 bg-[#c9c2ab] sm:h-[560px]"
            onPointerDown={() => setHasInteracted(true)}
            onWheel={() => setHasInteracted(true)}
          >
            {loading ? (
              <div className="flex h-full items-center justify-center text-forest">
                <Loader2 className="animate-spin" />
              </div>
            ) : plots.length === 0 ? (
              <div className="flex h-full items-center justify-center text-charcoal/50">No layout data for this project yet.</div>
            ) : (
              <Suspense fallback={<div className="flex h-full items-center justify-center text-forest"><Loader2 className="animate-spin" /></div>}>
                {mode === '3d' ? (
                  <PlotScene3D
                    key={resetKey}
                    plots={plots}
                    onSelect={setSelected}
                    selectedId={selected?.id ?? null}
                    autoRotate={!hasInteracted}
                  />
                ) : (
                  <PlotScene2D plots={plots} onSelect={setSelected} selectedId={selected?.id ?? null} />
                )}
              </Suspense>
            )}

            {showOnboarding && mode === '3d' && plots.length > 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-charcoal/55 p-6 backdrop-blur-sm">
                <div className="max-w-sm rounded-2xl bg-ivory p-6 text-center shadow-2xl">
                  <p className="font-display text-xl font-semibold text-forest">This layout is fully 3D</p>
                  <p className="mt-2 text-sm text-charcoal/60">
                    It's rotating gently right now so you can see the depth. Try it yourself:
                  </p>
                  <div className="mt-4 space-y-2 text-left text-sm text-charcoal/70">
                    <p className="flex items-center gap-2"><MousePointer2 size={15} className="text-forest shrink-0" /> Click and drag anywhere to rotate</p>
                    <p className="flex items-center gap-2"><ZoomIn size={15} className="text-forest shrink-0" /> Scroll to zoom in and out</p>
                    <p className="flex items-center gap-2"><MousePointerClick size={15} className="text-forest shrink-0" /> Click a colored plot to see its price, area, and status</p>
                  </div>
                  <button
                    onClick={() => { dismissOnboarding(); setHasInteracted(true); }}
                    className="mt-5 w-full rounded-full bg-forest py-2.5 text-sm font-semibold text-ivory"
                  >
                    Got it — let me try
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-forest/10 bg-white px-4 py-3 text-sm">
            <span className="font-medium text-charcoal/70">Legend:</span>
            {legendItems.map((item) => (
              <span key={item.status} className="flex items-center gap-1.5 capitalize text-charcoal/70">
                <span className={`h-3 w-3 rounded-sm ${item.color}`} /> {item.status}
              </span>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          {selected ? (
            <PlotDetailPanel plot={selected} onClose={() => setSelected(null)} />
          ) : (
            <div className="rounded-2xl border border-dashed border-forest/20 p-5 text-center text-sm text-charcoal/50">
              Select a plot to view its details here.
            </div>
          )}

          <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-2xl border border-forest/10 bg-white p-3">
            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-charcoal/40">All Plots in Layout</p>
            {plots.map((plot) => (
              <button
                key={plot.id}
                onClick={() => setSelected(plot)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  selected?.id === plot.id ? 'bg-sage/20' : 'hover:bg-sage/10'
                }`}
              >
                <span>
                  <span className="font-medium text-forest">{plot.plot_number}</span>
                  <span className="ml-2 text-charcoal/50">{formatArea(plot.area_sqft)}</span>
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusColors[plot.status]}`}>
                  {statusLabels[plot.status]}
                </span>
              </button>
            ))}
          </div>

          {selected && (
            <Link to={`/plots/${selected.slug}`} className="block text-center text-sm font-medium text-forest underline">
              {formatINR(selected.price)} — View full listing
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
