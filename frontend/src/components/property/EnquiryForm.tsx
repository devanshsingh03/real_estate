import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface EnquiryFormProps {
  propertyId?: number;
  type?: 'enquiry' | 'callback' | 'site_visit' | 'contact';
  title?: string;
}

export default function EnquiryForm({ propertyId, type = 'enquiry', title = 'Enquire About This Plot' }: EnquiryFormProps) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    preferredTime: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      await api.post('/enquiries', { ...form, propertyId, type });
      setStatus('success');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3 rounded-2xl border border-sage/40 bg-sage/10 px-6 py-10 text-center"
      >
        <CheckCircle2 size={36} className="text-forest" />
        <p className="font-display text-xl font-semibold text-forest">Thank you — we've received your enquiry</p>
        <p className="text-sm text-charcoal/60">Our team will reach out to you shortly.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {title && <h3 className="font-display text-xl font-semibold text-forest">{title}</h3>}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">Full Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">Phone Number</label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">Email (optional)</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">Preferred Contact Time</label>
        <select
          value={form.preferredTime}
          onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
          className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
        >
          <option value="">No preference</option>
          <option value="morning">Morning (9am – 12pm)</option>
          <option value="afternoon">Afternoon (12pm – 4pm)</option>
          <option value="evening">Evening (4pm – 8pm)</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">Message</label>
        <textarea
          rows={3}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell us a bit about what you're looking for..."
          className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
        />
      </div>

      <AnimatePresence>
        {status === 'error' && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-red-700">
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3.5 text-sm font-semibold text-ivory transition-colors hover:bg-charcoal disabled:opacity-60"
      >
        {status === 'submitting' && <Loader2 size={16} className="animate-spin" />}
        Submit Enquiry
      </button>
      <p className="text-center text-xs text-charcoal/40">
        We collect only the information needed to respond to your enquiry. It is never shared publicly.
      </p>
    </form>
  );
}
