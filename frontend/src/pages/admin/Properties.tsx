import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Star, BadgeCheck } from 'lucide-react';
import { api, resolveMediaUrl } from '../../lib/api';
import type { AdminProperty } from '../../types';
import { formatINR, formatArea, statusColors, statusLabels, propertyTypeLabels } from '../../lib/format';
import Skeleton from '../../components/ui/Skeleton';

export default function AdminProperties() {
  const [data, setData] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [published, setPublished] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(() => {
    setLoading(true);
    api
      .get('/admin/properties', { params: { search, status, published, page, pageSize: 10 } })
      .then((res) => {
        setData(res.data.data);
        setTotalPages(res.data.meta.totalPages);
      })
      .finally(() => setLoading(false));
  }, [search, status, published, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function togglePublished(p: AdminProperty) {
    await api.patch(`/admin/properties/${p.id}/status`, { published: !p.published });
    fetchData();
  }

  async function toggleFeatured(p: AdminProperty) {
    await api.patch(`/admin/properties/${p.id}/status`, { featured: !p.featured });
    fetchData();
  }

  async function handleDelete(p: AdminProperty) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    await api.delete(`/admin/properties/${p.id}`);
    fetchData();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest">Properties</h1>
          <p className="mt-1 text-sm text-charcoal/60">Manage all plot listings.</p>
        </div>
        <Link to="/admin/properties/new" className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-ivory">
          <Plus size={16} /> Add Plot
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-forest/15 bg-white px-3 py-2">
          <Search size={15} className="text-charcoal/40" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search title, plot number, project..."
            className="w-64 bg-transparent text-sm outline-none"
          />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-full border border-forest/15 bg-white px-3 py-2 text-sm outline-none">
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
        <select value={published} onChange={(e) => { setPublished(e.target.value); setPage(1); }} className="rounded-full border border-forest/15 bg-white px-3 py-2 text-sm outline-none">
          <option value="">Published + Draft</option>
          <option value="true">Published only</option>
          <option value="false">Draft only</option>
        </select>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-forest/10 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-forest/10 text-left text-xs uppercase tracking-wide text-charcoal/40">
              <th className="px-4 py-3">Plot</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-forest/5">
                  <td className="px-4 py-3" colSpan={6}><Skeleton className="h-10" /></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-charcoal/50">No plots found.</td></tr>
            ) : (
              data.map((p) => (
                <tr key={p.id} className="border-b border-forest/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-sage/20">
                        {p.images[0] && (
                          <img src={resolveMediaUrl(p.images[0].url)} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-forest">{p.plot_number} — {p.title}</p>
                        <p className="text-xs text-charcoal/50">{p.location ? `${p.location.locality}, ${p.location.city}` : '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-charcoal/70">{propertyTypeLabels[p.property_type]}</td>
                  <td className="px-4 py-3 text-charcoal/70">{formatINR(p.price)}<br /><span className="text-xs text-charcoal/40">{formatArea(p.area_sqft)}</span></td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[p.status]}`}>{statusLabels[p.status]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => togglePublished(p)} title={p.published ? 'Unpublish' : 'Publish'} className="text-charcoal/60 hover:text-forest">
                        {p.published ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button onClick={() => toggleFeatured(p)} title={p.featured ? 'Remove featured' : 'Mark featured'} className={p.featured ? 'text-champagne' : 'text-charcoal/30 hover:text-champagne'}>
                        <Star size={16} fill={p.featured ? 'currentColor' : 'none'} />
                      </button>
                      {!!p.verified && <BadgeCheck size={16} className="text-forest" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/properties/${p.id}`} className="rounded-lg p-1.5 text-forest hover:bg-sage/10" aria-label="Edit">
                        <Pencil size={16} />
                      </Link>
                      <button onClick={() => handleDelete(p)} className="rounded-lg p-1.5 text-red-700 hover:bg-red-50" aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-8 w-8 rounded-full text-sm ${page === i + 1 ? 'bg-forest text-ivory' : 'text-charcoal/60 hover:bg-forest/10'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
