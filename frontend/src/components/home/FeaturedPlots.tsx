import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProperties } from '../../hooks/useProperties';
import PropertyCard from '../property/PropertyCard';
import PropertyCardSkeleton from '../property/PropertyCardSkeleton';

export default function FeaturedPlots() {
  const { data, loading, error } = useProperties({ featured: 'true', pageSize: '8' });

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
      <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sage">Featured</p>
          <h2 className="font-display text-4xl font-semibold text-forest sm:text-5xl">Handpicked Plots</h2>
        </motion.div>
        <Link to="/plots" className="group flex items-center gap-1.5 text-sm font-medium text-forest">
          View All Plots <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <PropertyCardSkeleton key={i} />)
          : data.map((property, i) => <PropertyCard key={property.id} property={property} index={i} />)}
      </div>

      {!loading && data.length === 0 && !error && (
        <p className="py-10 text-center text-charcoal/60">No featured plots available right now.</p>
      )}
    </section>
  );
}
