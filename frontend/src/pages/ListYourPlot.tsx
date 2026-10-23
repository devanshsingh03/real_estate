import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

export default function ListYourPlot() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', city: '', area: '', expectedPrice: '', description: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    const message = `New plot listing submission.\nCity/Locality: ${form.city}\nArea: ${form.area} sq.ft.\nExpected Price: ₹${form.expectedPrice}\nDescription: ${form.description}`;
    try {
      await api.post('/enquiries', { name: form.name, phone: form.phone, email: form.email, message, type: 'contact' });
      setStatus('success');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-32 lg:px-10">
      <div className="mb-10 max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sage">For Plot Owners</p>
        <h1 className="font-display text-4xl font-semibold text-forest sm:text-5xl">List Your Plot</h1>
        <p className="mt-3 text-charcoal/60">
          Share your plot's details below and our team will reach out to discuss listing it on the platform.
        </p>
      </div>

      {status === 'success' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 rounded-2xl border border-sage/40 bg-sage/10 px-6 py-14 text-center"
        >
          <CheckCircle2 size={40} className="text-forest" />
          <p className="font-display text-2xl font-semibold text-forest">Submission received</p>
          <p className="text-sm text-charcoal/60">Our team will review your details and get in touch shortly.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-forest/10 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Full Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Phone Number</label>
              <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Email (optional)</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">City / Locality</label>
              <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Area (sq.ft.)</label>
              <input required type="number" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Expected Price (₹)</label>
              <input required type="number" value={form.expectedPrice} onChange={(e) => setForm({ ...form, expectedPrice: e.target.value })} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell us about the plot — boundaries, access, documentation, etc." className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={status === 'submitting'} className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3.5 text-sm font-semibold text-ivory disabled:opacity-60">
            {status === 'submitting' && <Loader2 size={16} className="animate-spin" />} Submit for Review
          </button>
        </form>
      )}
    </div>
  );
}
