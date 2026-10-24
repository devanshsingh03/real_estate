import { useEffect, useState } from 'react';
import { CreditCard, TrendingUp, Users } from 'lucide-react';
import { api } from '../../lib/api';
import Skeleton from '../../components/ui/Skeleton';

interface Order {
  id: number;
  user_name: string;
  user_email: string;
  plan_name: string;
  audience: string;
  amount_paise: number;
  status: string;
  created_at: string;
}

export default function AdminBilling() {
  const [data, setData] = useState<{ configured: boolean; totalRevenuePaise: number; activeSubscriptions: number; orders: Order[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/billing').then((res) => setData(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-forest">Billing</h1>
      <p className="mt-1 text-sm text-charcoal/60">Revenue from featured listings and premium buyer subscriptions.</p>

      {data && !data.configured && (
        <div className="mt-5 rounded-xl border border-champagne/60 bg-champagne/15 px-5 py-3 text-sm text-charcoal/70">
          Razorpay is not configured yet — add <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> to the backend environment to accept payments.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {loading ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <div className="rounded-2xl border border-forest/10 bg-white p-5">
              <TrendingUp size={18} className="text-sage" />
              <p className="mt-2 font-display text-2xl font-semibold text-forest">
                ₹{((data?.totalRevenuePaise || 0) / 100).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-charcoal/50">Total Revenue</p>
            </div>
            <div className="rounded-2xl border border-forest/10 bg-white p-5">
              <Users size={18} className="text-sage" />
              <p className="mt-2 font-display text-2xl font-semibold text-forest">{data?.activeSubscriptions || 0}</p>
              <p className="text-xs text-charcoal/50">Active Premium Subscriptions</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-forest/10 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-forest/10 text-left text-xs uppercase tracking-wide text-charcoal/40">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-3"><Skeleton className="h-10" /></td></tr>
            ) : !data || data.orders.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-charcoal/50"><CreditCard className="mx-auto mb-2" size={20} />No orders yet.</td></tr>
            ) : (
              data.orders.map((o) => (
                <tr key={o.id} className="border-b border-forest/5 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-forest">{o.user_name}</p>
                    <p className="text-xs text-charcoal/50">{o.user_email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-charcoal/70">{o.plan_name} <span className="text-xs text-charcoal/40">({o.audience})</span></td>
                  <td className="px-4 py-3 text-charcoal/70">₹{(o.amount_paise / 100).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                      o.status === 'paid' ? 'border-sage bg-sage/20 text-forest' : o.status === 'failed' ? 'border-red-200 bg-red-50 text-red-700' : 'border-charcoal/20 text-charcoal/60'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-charcoal/50">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
