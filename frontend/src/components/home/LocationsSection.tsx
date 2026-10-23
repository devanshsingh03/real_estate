import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useLocations } from '../../hooks/useLocations';
import { resolveMediaUrl } from '../../lib/api';
import Skeleton from '../ui/Skeleton';

export default function LocationsSection() {
  const { data, loading } = useLocations();

  return (
    <section className="bg-sage/10 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sage">Where to Invest</p>
          <h2 className="font-display text-4xl font-semibold text-forest sm:text-5xl">Popular Locations</h2>
          <p className="mt-3 text-charcoal/60">Explore active listings across our most sought-after regions.</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)
            : data.map((loc, i) => (
                <motion.div
                  key={loc.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    to={`/plots?city=${encodeURIComponent(loc.city)}`}
                    className="group relative block aspect-[3/4] overflow-hidden rounded-2xl focus-ring"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-forest via-charcoal to-forest/80 transition-transform duration-500 group-hover:scale-110">
                      <img
                        src={resolveMediaUrl(loc.image_url)}
                        alt={loc.locality}
                        loading="lazy"
                        className="h-full w-full object-cover opacity-70"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-ivory">
                      <p className="flex items-center justify-between font-display text-xl font-semibold">
                        {loc.locality}
                        <ArrowUpRight size={18} className="opacity-0 transition-opacity group-hover:opacity-100" />
                      </p>
                      <p className="text-sm text-ivory/70">{loc.city}</p>
                      <p className="mt-2 text-xs font-medium text-champagne">
                        {loc.activeListings ?? 0} active listing{loc.activeListings === 1 ? '' : 's'}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
