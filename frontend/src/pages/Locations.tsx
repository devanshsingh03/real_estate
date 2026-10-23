import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useLocations } from '../hooks/useLocations';
import { resolveMediaUrl } from '../lib/api';
import Skeleton from '../components/ui/Skeleton';
import { propertyTypeLabels } from '../lib/format';

export default function Locations() {
  const { data, loading } = useLocations();

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-32 lg:px-10">
      <div className="mb-12 max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sage">Investment Opportunities</p>
        <h1 className="font-display text-4xl font-semibold text-forest sm:text-5xl">Locations We Cover</h1>
        <p className="mt-3 text-charcoal/60">Browse active listings across each of our featured regions.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3]" />)
          : data.map((loc, i) => (
              <motion.div key={loc.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <Link to={`/plots?city=${encodeURIComponent(loc.city)}`} className="group block overflow-hidden rounded-2xl border border-forest/10 bg-white focus-ring">
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-forest to-charcoal">
                    <img
                      src={resolveMediaUrl(loc.image_url)}
                      alt={loc.locality}
                      className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl font-semibold text-forest">{loc.locality}</h3>
                      <ArrowUpRight size={18} className="text-forest/40 transition-colors group-hover:text-forest" />
                    </div>
                    <p className="text-sm text-charcoal/50">{loc.city}</p>
                    <p className="mt-2 text-sm text-charcoal/70">{loc.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-sage/20 px-3 py-1 text-xs font-medium text-forest">
                        {loc.activeListings ?? 0} active listing{loc.activeListings === 1 ? '' : 's'}
                      </span>
                      {(loc.propertyTypes || []).map((t) => (
                        <span key={t} className="rounded-full border border-forest/15 px-3 py-1 text-xs text-charcoal/60">
                          {propertyTypeLabels[t]}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
      </div>
    </div>
  );
}
