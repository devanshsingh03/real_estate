import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Ruler, BadgeCheck, Heart, Share2, Phone, Calendar, Ruler as RulerIcon, LandPlot, Eye,
} from 'lucide-react';
import { useProperty } from '../hooks/useProperty';
import ImageGallery from '../components/property/ImageGallery';
import EnquiryForm from '../components/property/EnquiryForm';
import PropertyCard from '../components/property/PropertyCard';
import Skeleton from '../components/ui/Skeleton';
import MapEmbed from '../components/ui/MapEmbed';
import EMICalculator from '../components/property/EMICalculator';
import { formatINR, formatArea, statusColors, statusLabels, propertyTypeLabels } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useConfig } from '../context/ConfigContext';

export default function PlotDetail() {
  const { slug } = useParams();
  const { data: property, loading, notFound } = useProperty(slug);
  const { user } = useAuth();
  const { whatsappNumber } = useConfig();
  const [favorited, setFavorited] = useState(false);
  const [showSiteVisit, setShowSiteVisit] = useState(false);

  if (notFound) return <Navigate to="/plots" replace />;

  async function toggleFavorite() {
    if (!user || !property) return;
    if (favorited) await api.delete(`/favorites/${property.id}`);
    else await api.post(`/favorites/${property.id}`);
    setFavorited((v) => !v);
  }

  async function shareLink() {
    if (navigator.share && property) {
      try {
        await navigator.share({ title: property.title, url: window.location.href });
        return;
      } catch { /* fall through */ }
    }
    await navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard');
  }

  if (loading || !property) {
    return (
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 lg:px-10">
        <Skeleton className="aspect-[16/10] w-full" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-32 pt-28 lg:px-10 lg:pb-24">
      <nav className="mb-4 text-sm text-charcoal/50">
        <Link to="/plots" className="hover:text-forest">Explore Plots</Link> / <span className="text-charcoal">{property.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <ImageGallery images={property.images} title={property.title} />
          </motion.div>

          <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusColors[property.status]}`}>
                  {statusLabels[property.status]}
                </span>
                {!!property.verified && (
                  <span className="flex items-center gap-1 rounded-full border border-forest/20 bg-sage/10 px-2.5 py-1 text-xs font-medium text-forest">
                    <BadgeCheck size={12} /> Verified
                  </span>
                )}
                <span className="rounded-full border border-forest/20 px-2.5 py-1 text-xs font-medium text-charcoal/70">
                  {propertyTypeLabels[property.property_type]}
                </span>
                {!!property.viewsToday && property.viewsToday >= 2 && (
                  <span className="flex items-center gap-1 rounded-full border border-champagne/60 bg-champagne/15 px-2.5 py-1 text-xs font-medium text-charcoal/70">
                    <Eye size={12} /> {property.viewsToday} views today
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">{property.title}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-charcoal/60">
                <MapPin size={15} />
                {property.location ? `${property.location.locality}, ${property.location.city}` : property.address}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleFavorite} className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/20 text-forest focus-ring" aria-label="Save to wishlist">
                <Heart size={18} fill={favorited ? '#102B25' : 'none'} />
              </button>
              <button onClick={shareLink} className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/20 text-forest focus-ring" aria-label="Share listing">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-forest/10 bg-white p-6 sm:grid-cols-4">
            <Stat icon={Ruler} label="Area" value={formatArea(property.area_sqft)} />
            <Stat icon={LandPlot} label="Dimensions" value={property.dimensions || '—'} />
            <Stat icon={RulerIcon} label="Frontage" value={property.frontage || '—'} />
            <Stat icon={Calendar} label="Listed" value={new Date(property.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} />
          </div>

          <section className="mt-10">
            <h2 className="mb-3 font-display text-2xl font-semibold text-forest">About This Plot</h2>
            <p className="leading-relaxed text-charcoal/70">{property.description}</p>
            {property.project_name && (
              <p className="mt-3 text-sm text-charcoal/50">Part of <span className="font-medium text-forest">{property.project_name}</span></p>
            )}
          </section>

          {property.amenities.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 font-display text-2xl font-semibold text-forest">Amenities</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {property.amenities.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 rounded-xl border border-forest/10 bg-white px-4 py-3 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-sage" /> {a.name}
                  </div>
                ))}
              </div>
            </section>
          )}

          {(property.latitude && property.longitude) && (
            <section className="mt-10">
              <h2 className="mb-4 font-display text-2xl font-semibold text-forest">Location</h2>
              <MapEmbed
                latitude={property.latitude}
                longitude={property.longitude}
                address={property.address}
                label={property.title}
                className="aspect-[16/8]"
              />
            </section>
          )}

          <section className="mt-10 lg:hidden">
            <EMICalculator price={property.price} />
          </section>

          <section className="mt-12 lg:hidden">
            <div className="rounded-2xl border border-forest/10 bg-white p-6">
              <EnquiryForm propertyId={property.id} />
            </div>
          </section>

          {property.similar && property.similar.length > 0 && (
            <section className="mt-14">
              <h2 className="mb-5 font-display text-2xl font-semibold text-forest">Similar Plots</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {property.similar.map((p, i) => <PropertyCard key={p.id} property={p} index={i} />)}
              </div>
            </section>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-4">
            <div className="rounded-2xl border border-forest/10 bg-white p-6 shadow-sm">
              <p className="font-display text-3xl font-semibold text-forest">{formatINR(property.price)}</p>
              <p className="text-sm text-charcoal/50">₹{Math.round(property.price / property.area_sqft).toLocaleString('en-IN')} / sq.ft.</p>

              <div className="mt-5 flex flex-col gap-2">
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in ${property.title}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full bg-[#1f7a4d] py-3 text-sm font-semibold text-white"
                  >
                    <Phone size={15} /> WhatsApp Enquiry
                  </a>
                )}
                <button
                  onClick={() => setShowSiteVisit(true)}
                  className="rounded-full border border-forest py-3 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory"
                >
                  Schedule a Site Visit
                </button>
              </div>
            </div>

            <EMICalculator price={property.price} />

            <div className="rounded-2xl border border-forest/10 bg-white p-6">
              <EnquiryForm propertyId={property.id} />
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-forest/10 bg-ivory p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden">
        <div>
          <p className="font-display text-lg font-semibold text-forest">{formatINR(property.price)}</p>
          <p className="text-xs text-charcoal/50">{formatArea(property.area_sqft)}</p>
        </div>
        <a href="#enquire" className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-ivory" onClick={() => {
          document.querySelector('section.lg\\:hidden')?.scrollIntoView({ behavior: 'smooth' });
        }}>
          Enquire Now
        </a>
      </div>

      {showSiteVisit && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-charcoal/50 p-4" onClick={() => setShowSiteVisit(false)}>
          <div className="w-full max-w-md rounded-2xl bg-ivory p-6" onClick={(e) => e.stopPropagation()}>
            <EnquiryForm propertyId={property.id} type="site_visit" title="Schedule a Site Visit" />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div>
      <Icon size={16} className="text-sage" />
      <p className="mt-1.5 text-xs text-charcoal/50">{label}</p>
      <p className="font-medium text-charcoal">{value}</p>
    </div>
  );
}
