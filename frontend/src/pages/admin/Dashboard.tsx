import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, Clock, XCircle, Inbox, Users } from 'lucide-react';
import { api } from '../../lib/api';
import type { AdminStats } from '../../types';
import Skeleton from '../../components/ui/Skeleton';

const statCards = [
  { key: 'totalListings', label: 'Total Listings', icon: Building2, color: 'text-forest' },
  { key: 'availablePlots', label: 'Available', icon: CheckCircle2, color: 'text-sage' },
  { key: 'reservedPlots', label: 'Reserved', icon: Clock, color: 'text-champagne' },
  { key: 'soldPlots', label: 'Sold', icon: XCircle, color: 'text-charcoal/50' },
  { key: 'newEnquiries', label: 'New Enquiries', icon: Inbox, color: 'text-forest' },
  { key: 'totalUsers', label: 'Registered Buyers', icon: Users, color: 'text-forest' },
] as const;

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-forest">Dashboard</h1>
      <p className="mt-1 text-sm text-charcoal/60">Overview of listings, enquiries, and recent activity.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          : statCards.map((c) => (
              <div key={c.key} className="rounded-2xl border border-forest/10 bg-white p-4">
                <c.icon size={18} className={c.color} />
                <p className="mt-2 font-display text-2xl font-semibold text-forest">{stats?.[c.key] ?? 0}</p>
                <p className="text-xs text-charcoal/50">{c.label}</p>
              </div>
            ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-forest/10 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-forest">Recent Enquiries</h2>
            <Link to="/admin/enquiries" className="text-xs font-medium text-forest underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : stats?.recentEnquiries.length ? (
            <div className="space-y-1">
              {stats.recentEnquiries.map((e) => (
                <Link
                  key={e.id}
                  to="/admin/enquiries"
                  className="flex items-center justify-between rounded-lg px-2 py-2.5 text-sm hover:bg-sage/10"
                >
                  <div>
                    <p className="font-medium text-charcoal">{e.name}</p>
                    <p className="text-xs text-charcoal/50">{e.property_title || 'General enquiry'} · {e.type}</p>
                  </div>
                  <span className="rounded-full border border-forest/15 px-2 py-0.5 text-[10px] capitalize text-charcoal/60">
                    {e.status.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-charcoal/50">No enquiries yet.</p>
          )}
        </div>

        <div className="rounded-2xl border border-forest/10 bg-white p-5">
          <h2 className="mb-3 font-display text-lg font-semibold text-forest">Recent Activity</h2>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : stats?.recentActivity.length ? (
            <div className="space-y-2">
              {stats.recentActivity.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span className="text-charcoal/70">
                    <span className="font-medium text-forest">{a.admin_name || 'Admin'}</span> {a.action.replace('_', ' ')} {a.entity_type}
                  </span>
                  <span className="text-xs text-charcoal/40">{new Date(a.created_at).toLocaleDateString('en-IN')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-charcoal/50">No activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
