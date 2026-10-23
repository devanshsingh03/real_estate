import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-7xl font-semibold text-forest">404</p>
      <p className="mt-3 text-lg text-charcoal/60">This page could not be found.</p>
      <Link to="/" className="mt-6 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-ivory">
        Back to Home
      </Link>
    </div>
  );
}
