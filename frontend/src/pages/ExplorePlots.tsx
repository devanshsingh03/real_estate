import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, LayoutGrid, List as ListIcon, BookmarkPlus, Check, Loader2 } from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import PropertyCard from '../components/property/PropertyCard';
import PropertyCardSkeleton from '../components/property/PropertyCardSkeleton';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const sortOptions = [
  { value: 'newest', label: 'Newest Listings' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'area_desc', label: 'Area: Largest First' },
];

export default function ExplorePlots() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const [savePanelOpen, setSavePanelOpen] = useState(false);
  const [saveLabel, setSaveLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';
  const propertyType = searchParams.get('propertyType') || '';
  const status = searchParams.get('status') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';

  const { data, meta, loading } = useProperties({
    search, city, propertyType, status, minPrice, maxPrice, sort,
    page: String(page), pageSize: '12',
  });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
    setPage(1);
  }

  function clearFilters() {
    setSearchParams({});
    setPage(1);
  }

  const activeFilterCount = [city, propertyType, status, minPrice, maxPrice].filter(Boolean).length;

  async function handleSaveSearch() {
    if (!saveLabel.trim()) return;
    setSaving(true);
    try {
      await api.post('/saved-searches', {
        label: saveLabel.trim(),
        criteria: { search, city, propertyType, status, minPrice, maxPrice, sort },
      });
      setSaved(true);
      setSaveLabel('');
      setTimeout(() => {
        setSaved(false);
        setSavePanelOpen(false);
      }, 1500);
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  const FilterContent = (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-charcoal/50">Search</label>
        <input
          type="text"
          defaultValue={search}
          onBlur={(e) => updateParam('search', e.target.value)}
          placeholder="City, locality, project..."
          className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-charcoal/50">Property Type</label>
        <div className="flex flex-wrap gap-2">
          {['', 'residential', 'commercial', 'agricultural'].map((t) => (
            <button
              key={t}
              onClick={() => updateParam('propertyType', t)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                propertyType === t ? 'border-forest bg-forest text-ivory' : 'border-forest/20 text-charcoal/70 hover:border-forest/40'
              }`}
            >
              {t || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-charcoal/50">Availability</label>
        <div className="flex flex-wrap gap-2">
          {['', 'available', 'reserved', 'sold'].map((s) => (
            <button
              key={s}
              onClick={() => updateParam('status', s)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                status === s ? 'border-forest bg-forest text-ivory' : 'border-forest/20 text-charcoal/70 hover:border-forest/40'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-charcoal/50">Min Price (₹)</label>
          <input
            type="number"
            defaultValue={minPrice}
            onBlur={(e) => updateParam('minPrice', e.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-charcoal/50">Max Price (₹)</label>
          <input
            type="number"
            defaultValue={maxPrice}
            onBlur={(e) => updateParam('maxPrice', e.target.value)}
            placeholder="Any"
            className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest"
          />
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm font-medium text-forest underline">
          <X size={14} /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-32 lg:px-10">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-display text-4xl font-semibold text-forest sm:text-5xl">Explore Plots</h1>
        <p className="text-charcoal/60">{meta ? `${meta.total} plots found` : 'Loading plots...'}</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-28 rounded-2xl border border-forest/10 bg-white p-5">
            <h2 className="mb-4 font-display text-lg font-semibold text-forest">Filters</h2>
            {FilterContent}
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 rounded-full border border-forest/20 px-4 py-2 text-sm font-medium lg:hidden"
            >
              <SlidersHorizontal size={15} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>

            <div className="flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="rounded-full border border-forest/20 bg-white px-3 py-2 text-sm outline-none"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <div className="hidden items-center gap-1 rounded-full border border-forest/20 p-1 sm:flex">
                <button
                  onClick={() => setView('grid')}
                  className={`rounded-full p-1.5 ${view === 'grid' ? 'bg-forest text-ivory' : 'text-charcoal/50'}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`rounded-full p-1.5 ${view === 'list' ? 'bg-forest text-ivory' : 'text-charcoal/50'}`}
                  aria-label="List view"
                >
                  <ListIcon size={16} />
                </button>
              </div>

              {user ? (
                <button
                  onClick={() => setSavePanelOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full border border-forest/20 px-3.5 py-2 text-sm text-charcoal/70 hover:border-forest/40"
                >
                  <BookmarkPlus size={15} /> Save Search
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 rounded-full border border-forest/20 px-3.5 py-2 text-sm text-charcoal/70 hover:border-forest/40"
                >
                  <BookmarkPlus size={15} /> Save Search
                </Link>
              )}
            </div>
          </div>

          <AnimatePresence>
            {savePanelOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden rounded-xl border border-forest/15 bg-white"
              >
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <input
                    value={saveLabel}
                    onChange={(e) => setSaveLabel(e.target.value)}
                    placeholder="Name this search, e.g. Katni plots under 50L"
                    className="min-w-[240px] flex-1 rounded-lg border border-forest/15 px-3 py-2 text-sm outline-none focus:border-forest"
                  />
                  <button
                    onClick={handleSaveSearch}
                    disabled={saving || !saveLabel.trim()}
                    className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-ivory disabled:opacity-50"
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {saved && <Check size={14} />}
                    {saved ? 'Saved' : 'Save'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={view === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-4'}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)
              : data.map((property, i) => <PropertyCard key={property.id} property={property} index={i} />)}
          </div>

          {!loading && data.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-forest/20 py-20 text-center">
              <p className="font-display text-xl text-forest">No plots match your search</p>
              <p className="max-w-sm text-sm text-charcoal/60">Try adjusting your filters or search a different location.</p>
              <button onClick={clearFilters} className="mt-2 rounded-full bg-forest px-5 py-2 text-sm text-ivory">
                Clear Filters
              </button>
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {Array.from({ length: meta.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`h-9 w-9 rounded-full text-sm font-medium ${
                    page === i + 1 ? 'bg-forest text-ivory' : 'text-charcoal/60 hover:bg-forest/10'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-charcoal/50 lg:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-ivory p-6 lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-forest">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                  <X size={20} />
                </button>
              </div>
              {FilterContent}
              <button
                onClick={() => setFiltersOpen(false)}
                className="mt-6 w-full rounded-full bg-forest py-3 text-sm font-semibold text-ivory"
              >
                Show Results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
