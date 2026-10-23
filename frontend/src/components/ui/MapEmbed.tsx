interface MapEmbedProps {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  label?: string;
  zoom?: number;
  className?: string;
}

export default function MapEmbed({ latitude, longitude, address, label, zoom = 15, className = '' }: MapEmbedProps) {
  const hasCoords = latitude != null && longitude != null;
  const query = hasCoords ? `${latitude},${longitude}` : address;

  if (!query) {
    return (
      <div className={`flex items-center justify-center rounded-2xl border border-forest/10 bg-sage/10 text-sm text-charcoal/50 ${className}`}>
        Location not yet available for this listing.
      </div>
    );
  }

  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-forest/10">
      <div className={`relative w-full ${className}`}>
        <iframe
          title={label || 'Location map'}
          src={src}
          className="absolute inset-0 h-full w-full"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="flex items-center justify-between border-t border-forest/10 bg-white px-4 py-2.5 text-xs">
        <span className="text-charcoal/50">{address || 'Approximate location'}</span>
        <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-forest underline">
          Get Directions
        </a>
      </div>
    </div>
  );
}
