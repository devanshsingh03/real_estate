import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Search, BookmarkPlus } from 'lucide-react';
import { api } from '../lib/api';
import Skeleton from '../components/ui/Skeleton';
import { propertyTypeLabels } from '../lib/format';

interface SavedSearch {
  id: number;
  label: string;
  criteria: Record<string, string>;
  created_at: string;
}

function criteriaToQuery(criteria: Record<string, string>): string {
  const params = new URLSearchParams();
  Object.entries(criteria).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  return params.toString();
}

function criteriaSummary(criteria: Record<string, string>): string {
  const parts: string[] = [];
  if (criteria.search) parts.push(`"${criteria.search}"`);
  if (criteria.city) parts.push(criteria.city);
  if (criteria.propertyType) parts.push(propertyTypeLabels[criteria.propertyType] || criteria.propertyType);
  if (criteria.status) parts.push(criteria.status);
  if (criteria.minPrice || criteria.maxPrice) {
    parts.push(`₹${criteria.minPrice ? Number(criteria.minPrice).toLocaleString('en-IN') : '0'} – ${criteria.maxPrice ? Number(criteria.maxPrice).toLocaleString('en-IN') : 'Any'}`);
  }
  return parts.length ? parts.join(' · ') : 'All plots';
}

export default function SavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  function fetchData() {
    setLoading(true);
    api.get('/saved-searches').then((res) => setSearches(res.data.data)).finally(() => setLoading(false));
  }

  useEffect(() => { fetchData(); }, []);

  async function handleDelete(id: number) {
    await api.delete(`/saved-searches/${id}`);
    setSearches((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-32 lg:px-10">
      <h1 className="mb-2 font-display text-4xl font-semibold text-forest">Saved Searches</h1>
      <p className="mb-8 text-sm text-charcoal/60">Revisit a search any time, or jump straight back into your filters.</p>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : searches.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-forest/20 py-20 text-center">
          <BookmarkPlus size={28} className="text-sage" />
          <p className="font-display text-xl text-forest">No saved searches yet</p>
          <p className="max-w-sm text-sm text-charcoal/60">Set your filters on Explore Plots and tap "Save Search" to find them here later.</p>
          <Link to="/plots" className="mt-2 rounded-full bg-forest px-5 py-2 text-sm text-ivory">Explore Plots</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 rounded-2xl border border-forest/10 bg-white p-5">
              <div className="min-w-0">
                <p className="font-medium text-forest">{s.label}</p>
                <p className="truncate text-sm text-charcoal/50">{criteriaSummary(s.criteria)}</p>
                <p className="mt-0.5 text-xs text-charcoal/40">Saved {new Date(s.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to={`/plots?${criteriaToQuery(s.criteria)}`}
                  className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-ivory"
                >
                  <Search size={13} /> Run
                </Link>
                <button onClick={() => handleDelete(s.id)} className="rounded-lg p-2 text-red-700 hover:bg-red-50" aria-label="Delete saved search">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
