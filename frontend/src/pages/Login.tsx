import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Unable to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-32">
      <h1 className="font-display text-3xl font-semibold text-forest">Welcome Back</h1>
      <p className="mt-2 text-sm text-charcoal/60">Log in to manage your wishlist and enquiries.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
          />
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3 text-sm font-semibold text-ivory disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />} Log In
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-charcoal/60">
        Don't have an account? <Link to="/register" className="font-medium text-forest underline">Register</Link>
      </p>
      <p className="mt-4 text-center text-xs text-charcoal/40">Demo: buyer@example.com / Buyer@12345</p>
    </div>
  );
}
