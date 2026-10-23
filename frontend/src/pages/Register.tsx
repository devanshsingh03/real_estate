import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-32">
      <h1 className="font-display text-3xl font-semibold text-forest">Create Your Account</h1>
      <p className="mt-2 text-sm text-charcoal/60">Save plots to your wishlist and track your enquiries.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">Full Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">Phone (optional)</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">Password</label>
          <input
            required
            minLength={8}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
          />
          <p className="mt-1 text-xs text-charcoal/40">At least 8 characters</p>
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3 text-sm font-semibold text-ivory disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />} Create Account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-charcoal/60">
        Already have an account? <Link to="/login" className="font-medium text-forest underline">Log in</Link>
      </p>
    </div>
  );
}
