import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import type { LayoutPlot } from '../../hooks/useLayoutPlots';
import { formatINR, formatArea, statusColors, statusLabels } from '../../lib/format';

export default function PlotDetailPanel({ plot, onClose }: { plot: LayoutPlot; onClose: () => void }) {
  return (
    <div className="rounded-2xl border border-forest/10 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold text-forest">Plot {plot.plot_number}</h3>
        <button onClick={onClose} aria-label="Close panel" className="text-charcoal/50 hover:text-charcoal">
          <X size={18} />
        </button>
      </div>
      <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium ${statusColors[plot.status]}`}>
        {statusLabels[plot.status]}
      </span>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-charcoal/50">Area</span><span className="font-medium">{formatArea(plot.area_sqft)}</span></div>
        <div className="flex justify-between"><span className="text-charcoal/50">Price</span><span className="font-medium">{formatINR(plot.price)}</span></div>
        <div className="flex justify-between"><span className="text-charcoal/50">Project</span><span className="font-medium">{plot.project_name}</span></div>
      </div>
      <Link
        to={`/plots/${plot.slug}`}
        className="mt-5 block rounded-full bg-forest py-2.5 text-center text-sm font-semibold text-ivory transition-colors hover:bg-charcoal"
      >
        View Full Details
      </Link>
    </div>
  );
}
