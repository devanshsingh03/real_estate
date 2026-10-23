import { useRef, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, BadgeCheck, Ruler, Scale, Check } from 'lucide-react';
import type { Property } from '../../types';
import { formatINR, formatArea, statusColors, statusLabels, propertyTypeLabels } from '../../lib/format';
import { resolveMediaUrl } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { useCompare } from '../../context/CompareContext';

interface PropertyCardProps {
  property: Property;
  index?: number;
}

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [favorited, setFavorited] = useState(!!property.isFavorited);
  const { user } = useAuth();
  const { isComparing, toggleCompare, maxReached } = useCompare();
  const comparing = isComparing(property.id);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -6, y: px * 6 });
  }

  function handleToggleCompare(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(property.id);
  }

  async function toggleFavorite(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      if (favorited) {
        await api.delete(`/favorites/${property.id}`);
      } else {
        await api.post(`/favorites/${property.id}`);
      }
      setFavorited((v) => !v);
    } catch {
      /* ignore */
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3) }}
    >
      <Link to={`/plots/${property.slug}`} className="group block focus-ring">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
          className="relative overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-sm transition-shadow duration-350 will-change-transform group-hover:shadow-xl"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-sage/20">
            <img
              src={resolveMediaUrl(property.images[0])}
              alt={property.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />

            <div className="absolute left-3 top-3 flex gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-sm ${statusColors[property.status]}`}>
                {statusLabels[property.status]}
              </span>
              {!!property.verified && (
                <span className="flex items-center gap-1 rounded-full border border-forest/20 bg-ivory/90 px-2.5 py-1 text-xs font-medium text-forest">
                  <BadgeCheck size={12} /> Verified
                </span>
              )}
            </div>

            <button
              onClick={toggleFavorite}
              aria-label={favorited ? 'Remove from wishlist' : 'Save to wishlist'}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 text-forest backdrop-blur-sm transition-transform duration-200 hover:scale-110 focus-ring"
            >
              <Heart size={16} fill={favorited ? '#102B25' : 'none'} />
            </button>

            <div className="absolute bottom-3 left-3 rounded-full bg-ivory/90 px-3 py-1 text-xs font-medium text-charcoal backdrop-blur-sm">
              {propertyTypeLabels[property.property_type]}
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-display text-lg font-semibold leading-snug text-forest line-clamp-1">{property.title}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-charcoal/60">
              <MapPin size={14} />
              {property.location ? `${property.location.locality}, ${property.location.city}` : 'Location unavailable'}
            </p>

            <div className="mt-3 flex items-center justify-between border-t border-forest/10 pt-3">
              <div>
                <p className="font-display text-xl font-semibold text-forest">{formatINR(property.price)}</p>
                <p className="flex items-center gap-1 text-xs text-charcoal/60">
                  <Ruler size={12} /> {formatArea(property.area_sqft)}
                </p>
              </div>
              <span className="rounded-full border border-forest px-4 py-2 text-xs font-medium text-forest transition-colors duration-250 group-hover:bg-forest group-hover:text-ivory">
                View Details
              </span>
            </div>

            <button
              onClick={handleToggleCompare}
              disabled={!comparing && maxReached}
              className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                comparing ? 'border-forest bg-forest text-ivory' : 'border-forest/15 text-charcoal/60 hover:border-forest/40'
              }`}
            >
              {comparing ? <Check size={13} /> : <Scale size={13} />}
              {comparing ? 'Added to Compare' : 'Add to Compare'}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
