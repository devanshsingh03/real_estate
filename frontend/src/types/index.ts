export type PropertyType = 'residential' | 'commercial' | 'agricultural';
export type PropertyStatus = 'available' | 'reserved' | 'sold';

export interface Plan {
  id: number;
  key: string;
  audience: 'seller' | 'buyer';
  name: string;
  description: string;
  price_paise: number;
  billing_period: 'one_time' | 'monthly' | 'yearly';
  features: string[];
}

export interface BillingStatus {
  isPremium: boolean;
  plan: { key: string; name: string; expiresAt: string | null } | null;
  savedSearchLimit: number;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string;
}

export interface Location {
  id: number;
  city: string;
  locality: string;
  image_url?: string;
  description?: string;
  activeListings?: number;
  propertyTypes?: PropertyType[];
}

export interface Property {
  id: number;
  title: string;
  slug: string;
  description: string;
  property_type: PropertyType;
  status: PropertyStatus;
  published: number;
  featured: number;
  price: number;
  area_sqft: number;
  dimensions?: string;
  frontage?: string;
  location_id: number | null;
  address?: string;
  latitude?: number;
  longitude?: number;
  project_name?: string;
  verified: number;
  plot_number?: string;
  layout_x?: number;
  layout_y?: number;
  layout_w?: number;
  layout_d?: number;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  images: string[];
  amenities: Amenity[];
  location: { id: number; city: string; locality: string } | null;
  similar?: Property[];
  isFavorited?: boolean;
  viewsToday?: number;
}

export interface ApiMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: ApiMeta;
  error?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'buyer' | 'admin';
}

export interface Enquiry {
  id: number;
  property_id: number | null;
  property_title?: string;
  property_slug?: string;
  name: string;
  phone: string;
  email?: string;
  preferred_time?: string;
  message?: string;
  type: 'enquiry' | 'callback' | 'site_visit' | 'contact';
  status: 'new' | 'contacted' | 'in_progress' | 'closed';
  internal_notes?: string;
  follow_up_date?: string;
  created_at: string;
}

export interface EnquiryHistoryEntry {
  id: number;
  status: string;
  note?: string;
  changed_by_name?: string;
  created_at: string;
}

export interface AdminPropertyImage {
  id: number;
  url: string;
  sort_order: number;
}

export interface AdminProperty extends Omit<Property, 'images' | 'similar' | 'isFavorited'> {
  images: AdminPropertyImage[];
}

export interface SiteSettings {
  brandName: string;
  whatsappNumber: string;
  contactEmail: string;
  logoUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
}

export interface AdminStats {
  totalListings: number;
  availablePlots: number;
  reservedPlots: number;
  soldPlots: number;
  publishedListings: number;
  draftListings: number;
  newEnquiries: number;
  totalEnquiries: number;
  totalUsers: number;
  recentEnquiries: Array<{ id: number; name: string; type: string; status: string; created_at: string; property_title?: string }>;
  recentActivity: Array<{ id: number; action: string; entity_type?: string; entity_id?: number; admin_name?: string; created_at: string }>;
}
