import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import { resolveMediaUrl } from '../../lib/api';

export default function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const valid = images.length ? images : ['/placeholder.jpg'];

  function next() {
    setActive((i) => (i + 1) % valid.length);
  }
  function prev() {
    setActive((i) => (i - 1 + valid.length) % valid.length);
  }

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-sage/20">
        <img
          src={resolveMediaUrl(valid[active])}
          alt={`${title} — image ${active + 1}`}
          className="h-full w-full object-cover"
          onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0')}
        />
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 text-forest backdrop-blur-sm focus-ring"
          aria-label="Open fullscreen gallery"
        >
          <Expand size={18} />
        </button>
        {valid.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/80 text-forest backdrop-blur-sm focus-ring"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/80 text-forest backdrop-blur-sm focus-ring"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {valid.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {valid.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                active === i ? 'border-forest' : 'border-transparent'
              }`}
            >
              <img
                src={resolveMediaUrl(img)}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0')}
              />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/95 p-4"
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-6 top-6 text-ivory focus-ring"
              aria-label="Close gallery"
            >
              <X size={28} />
            </button>
            <img
              src={resolveMediaUrl(valid[active])}
              alt={title}
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {valid.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-ivory focus-ring"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-ivory focus-ring"
                  aria-label="Next image"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
