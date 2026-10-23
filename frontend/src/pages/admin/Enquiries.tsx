import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../../lib/api';
import type { Enquiry } from '../../types';
import Skeleton from '../../components/ui/Skeleton';

const statusStyles: Record<string, string> = {
  new: 'bg-sage/20 text-forest border-sage',
  contacted: 'bg-champagne/30 text-charcoal border-champagne',
  in_progress: 'bg-champagne/30 text-charcoal border-champagne',
  closed: 'bg-charcoal/10 text-charcoal/60 border-charcoal/20',
};

export default function AdminEnquiries() {
  const [data, setData] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(() => {
    setLoading(true);
    api
      .get('/admin/enquiries', { params: { search, status, type, page, pageSize: 15 } })
      .then((res) => {
        setData(res.data.data);
        setTotalPages(res.data.meta.totalPages);
      })
      .finally(() => setLoading(false));
  }, [search, status, type, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function quickUpdateStatus(id: number, newStatus: string) {
    await api.patch(`/admin/enquiries/${id}`, { status: newStatus });
    fetchData();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-forest">Enquiries</h1>
      <p className="mt-1 text-sm text-charcoal/60">Review and manage buyer enquiries, callbacks, and site visit requests.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-forest/15 bg-white px-3 py-2">
          <Search size={15} className="text-charcoal/40" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, phone, email..." className="w-64 bg-transparent text-sm outline-none" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-full border border-forest/15 bg-white px-3 py-2 text-sm outline-none">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="rounded-full border border-forest/15 bg-white px-3 py-2 text-sm outline-none">
          <option value="">All types</option>
          <option value="enquiry">Enquiry</option>
          <option value="callback">Callback</option>
          <option value="site_visit">Site Visit</option>
          <option value="contact">Contact</option>
        </select>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-forest/10 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-forest/10 text-left text-xs uppercase tracking-wide text-charcoal/40">
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-forest/5"><td className="px-4 py-3" colSpan={6}><Skeleton className="h-10" /></td></tr>
              ))
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-charcoal/50">No enquiries found.</td></tr>
            ) : (
              data.map((e) => (
                <tr key={e.id} className="border-b border-forest/5 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-forest">{e.name}</p>
                    <p className="text-xs text-charcoal/50">{e.phone}{e.email ? ` · ${e.email}` : ''}</p>
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">{e.property_title || 'General'}</td>
                  <td className="px-4 py-3 capitalize text-charcoal/70">{e.type.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    <select
                      value={e.status}
                      onChange={(ev) => quickUpdateStatus(e.id, ev.target.value)}
                      className={`rounded-full border px-2 py-1 text-xs font-medium capitalize outline-none ${statusStyles[e.status]}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-charcoal/50">{new Date(e.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/enquiries/${e.id}`} className="text-xs font-medium text-forest underline">View</Link>
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
            <button key={i} onClick={() => setPage(i + 1)} className={`h-8 w-8 rounded-full text-sm ${page === i + 1 ? 'bg-forest text-ivory' : 'text-charcoal/60 hover:bg-forest/10'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
