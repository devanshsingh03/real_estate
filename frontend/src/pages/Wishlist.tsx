import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Property } from '../types';
import PropertyCard from '../components/property/PropertyCard';
import PropertyCardSkeleton from '../components/property/PropertyCardSkeleton';

export default function Wishlist() {
  const [data, setData] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/favorites').then((res) => setData(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-32 lg:px-10">
      <h1 className="mb-8 font-display text-4xl font-semibold text-forest">My Wishlist</h1>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-forest/20 py-20 text-center">
          <p className="font-display text-xl text-forest">Your wishlist is empty</p>
          <p className="text-sm text-charcoal/60">Save plots you're interested in to find them here later.</p>
          <Link to="/plots" className="mt-2 rounded-full bg-forest px-5 py-2 text-sm text-ivory">Explore Plots</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p, i) => <PropertyCard key={p.id} property={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
