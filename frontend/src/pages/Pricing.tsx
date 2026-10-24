import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useBilling } from '../hooks/useBilling';
import { openRazorpayCheckout } from '../lib/razorpay';
import type { Plan } from '../types';

function formatPrice(paise: number, period: string) {
  if (paise === 0) return 'Free';
  const rupees = paise / 100;
  const suffix = period === 'monthly' ? '/mo' : period === 'yearly' ? '/yr' : '';
  return `₹${rupees.toLocaleString('en-IN')}${suffix}`;
}

export default function Pricing() {
  const [tab, setTab] = useState<'buyer' | 'seller'>('buyer');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [payingKey, setPayingKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { billing, refetch } = useBilling();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/billing/plans').then((res) => {
      setPlans(res.data.data.plans);
      setConfigured(res.data.data.configured);
    }).finally(() => setLoading(false));
  }, []);

  async function handleChoose(plan: Plan) {
    setError('');
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/pricing' } } });
      return;
    }
    if (plan.price_paise === 0) return;

    setPayingKey(plan.key);
    try {
      const res = await api.post('/billing/create-order', { planKey: plan.key });
      const { orderId, amount, currency, keyId } = res.data.data;
      await openRazorpayCheckout({
        orderId,
        amount,
        currency,
        keyId,
        name: plan.name,
        description: `${plan.name} — Real Estate Bros`,
        prefillName: user.name,
        prefillEmail: user.email,
        prefillContact: user.phone,
        onSuccess: async (response) => {
          await api.post('/billing/verify', response);
          refetch();
          alert(`Payment successful! You're now on ${plan.name}.`);
        },
        onDismiss: () => setPayingKey(null),
      });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Could not start payment. Please try again.');
    } finally {
      setPayingKey(null);
    }
  }

  const visiblePlans = plans.filter((p) => p.audience === tab);

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-32 lg:px-10">
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sage">Pricing</p>
        <h1 className="font-display text-4xl font-semibold text-forest sm:text-5xl">Plans for Buyers & Sellers</h1>
        <p className="mx-auto mt-3 max-w-xl text-charcoal/60">
          Browse and enquire for free. Upgrade for faster listing review, featured placement, or unlimited saved searches.
        </p>
      </div>

      {!configured && (
        <div className="mb-8 rounded-xl border border-champagne/60 bg-champagne/15 px-5 py-3 text-center text-sm text-charcoal/70">
          Online payments are being set up — paid plans will be available shortly.
        </div>
      )}

      {billing?.isPremium && (
        <div className="mb-8 flex items-center justify-center gap-2 rounded-xl border border-sage/40 bg-sage/10 px-5 py-3 text-sm font-medium text-forest">
          <Sparkles size={16} /> You're on {billing.plan?.name}
          {billing.plan?.expiresAt && ` — renews/expires ${new Date(billing.plan.expiresAt).toLocaleDateString('en-IN')}`}
        </div>
      )}

      <div className="mb-10 flex justify-center">
        <div className="flex items-center gap-1 rounded-full border border-forest/15 bg-white p-1">
          <button
            onClick={() => setTab('buyer')}
            className={`rounded-full px-5 py-2 text-sm font-medium ${tab === 'buyer' ? 'bg-forest text-ivory' : 'text-charcoal/60'}`}
          >
            For Buyers
          </button>
          <button
            onClick={() => setTab('seller')}
            className={`rounded-full px-5 py-2 text-sm font-medium ${tab === 'seller' ? 'bg-forest text-ivory' : 'text-charcoal/60'}`}
          >
            For Sellers
          </button>
        </div>
      </div>

      {error && <p className="mb-4 text-center text-sm text-red-700">{error}</p>}

      {loading ? (
        <p className="text-center text-charcoal/50">Loading plans…</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {visiblePlans.map((plan) => {
            const isFree = plan.price_paise === 0;
            const isCurrent = billing?.plan?.key === plan.key;
            return (
              <div
                key={plan.key}
                className={`rounded-2xl border bg-white p-6 ${isFree ? 'border-forest/10' : 'border-forest shadow-lg'}`}
              >
                {!isFree && (
                  <span className="mb-3 inline-block rounded-full bg-champagne/40 px-3 py-1 text-xs font-semibold text-forest">
                    Recommended
                  </span>
                )}
                <h2 className="font-display text-2xl font-semibold text-forest">{plan.name}</h2>
                <p className="mt-1 text-sm text-charcoal/60">{plan.description}</p>
                <p className="mt-4 font-display text-3xl font-semibold text-forest">
                  {formatPrice(plan.price_paise, plan.billing_period)}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-charcoal/70">
                      <Check size={16} className="mt-0.5 shrink-0 text-sage" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleChoose(plan)}
                  disabled={isFree || isCurrent || payingKey === plan.key || (!configured && !isFree)}
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-colors disabled:opacity-50 ${
                    isFree ? 'border border-forest/20 text-charcoal/50' : 'bg-forest text-ivory hover:bg-charcoal'
                  }`}
                >
                  {payingKey === plan.key && <Loader2 size={16} className="animate-spin" />}
                  {isCurrent ? 'Current Plan' : isFree ? 'Included' : 'Choose Plan'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
