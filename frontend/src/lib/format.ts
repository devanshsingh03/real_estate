export function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export function formatArea(sqft: number): string {
  return `${sqft.toLocaleString('en-IN')} sq.ft.`;
}

export const statusLabels: Record<string, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
};

export const statusColors: Record<string, string> = {
  available: 'bg-sage/30 text-forest border-sage',
  reserved: 'bg-champagne/40 text-charcoal border-champagne',
  sold: 'bg-charcoal/10 text-charcoal/60 border-charcoal/20',
};

export const propertyTypeLabels: Record<string, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
  agricultural: 'Agricultural',
};
