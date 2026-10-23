import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { X, Check, Minus } from 'lucide-react';
import { api, resolveMediaUrl } from '../lib/api';
import type { Property } from '../types';
import { useCompare } from '../context/CompareContext';
import { formatINR, formatArea, statusColors, statusLabels, propertyTypeLabels } from '../lib/format';
import Skeleton from '../components/ui/Skeleton';

const rows: Array<{ label: string; render: (p: Property) => React.ReactNode }> = [
  { label: 'Price', render: (p) => <span className="font-display text-lg font-semibold text-forest">{formatINR(p.price)}</span> },
  { label: 'Price / sq.ft.', render: (p) => `₹${Math.round(p.price / p.area_sqft).toLocaleString('en-IN')}` },
  { label: 'Area', render: (p) => formatArea(p.area_sqft) },
  { label: 'Dimensions', render: (p) => p.dimensions || '—' },
  { label: 'Frontage', render: (p) => p.frontage || '—' },
  { label: 'Type', render: (p) => propertyTypeLabels[p.property_type] },
  {
    label: 'Status',
    render: (p) => (
      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[p.status]}`}>{statusLabels[p.status]}</span>
    ),
  },
  { label: 'Location', render: (p) => (p.location ? `${p.location.locality}, ${p.location.city}` : '—') },
  { label: 'Project', render: (p) => p.project_name || '—' },
  { label: 'Verified', render: (p) => (p.verified ? <Check size={16} className="text-sage" /> : <Minus size={16} className="text-charcoal/30" />) },
];

export default function ComparePlots() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { removeFromCompare } = useCompare();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const ids = (searchParams.get('ids') || '').split(',').filter(Boolean);

  function handleRemove(id: number) {
    removeFromCompare(id);
    const remaining = ids.filter((idStr) => idStr !== String(id));
    if (remaining.length > 0) setSearchParams({ ids: remaining.join(',') });
    else setSearchParams({});
  }

  useEffect(() => {
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get('/properties/by-ids', { params: { ids: ids.join(',') } })
      .then((res) => setProperties(res.data.data))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('ids')]);

  const amenityUnion = Array.from(
    new Map(properties.flatMap((p) => p.amenities).map((a) => [a.id, a])).values()
  );

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 lg:px-10">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sage">Side by Side</p>
        <h1 className="font-display text-4xl font-semibold text-forest sm:text-5xl">Compare Plots</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-forest/20 py-20 text-center">
          <p className="font-display text-xl text-forest">Nothing to compare yet</p>
          <p className="text-sm text-charcoal/60">Add plots to compare from the Explore Plots page.</p>
          <Link to="/plots" className="mt-2 rounded-full bg-forest px-5 py-2 text-sm text-ivory">Explore Plots</Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="w-40" />
                {properties.map((p) => (
                  <th key={p.id} className="px-3 pb-4 text-left align-top">
                    <div className="relative overflow-hidden rounded-xl border border-forest/10 bg-white">
                      <button
                        onClick={() => handleRemove(p.id)}
                        aria-label="Remove from comparison"
                        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-ivory/90 text-charcoal"
                      >
                        <X size={14} />
                      </button>
                      <img
                        src={resolveMediaUrl(p.images[0])}
                        alt={p.title}
                        className="aspect-[4/3] w-full object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0')}
                      />
                      <div className="p-3">
                        <p className="line-clamp-2 text-sm font-semibold text-forest">{p.title}</p>
                        <Link to={`/plots/${p.slug}`} className="mt-2 block rounded-full bg-forest py-1.5 text-center text-xs font-medium text-ivory">
                          View Full Details
                        </Link>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : ''}>
                  <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-charcoal/60">{row.label}</td>
                  {properties.map((p) => (
                    <td key={p.id} className="px-3 py-3 text-sm text-charcoal">{row.render(p)}</td>
                  ))}
                </tr>
              ))}
              {amenityUnion.length > 0 && (
                <tr>
                  <td className="whitespace-nowrap px-3 py-3 align-top text-sm font-medium text-charcoal/60">Amenities</td>
                  {properties.map((p) => (
                    <td key={p.id} className="px-3 py-3 align-top">
                      <ul className="space-y-1 text-xs">
                        {amenityUnion.map((a) => {
                          const has = p.amenities.some((pa) => pa.id === a.id);
                          return (
                            <li key={a.id} className={`flex items-center gap-1.5 ${has ? 'text-charcoal' : 'text-charcoal/30'}`}>
                              {has ? <Check size={12} className="text-sage" /> : <Minus size={12} />}
                              {a.name}
                            </li>
                          );
                        })}
                      </ul>
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
