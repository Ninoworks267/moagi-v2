export type Role = "tenant" | "landlord" | "admin";

export interface User {
  id: number;
  first_name: string;
  surname: string;
  role: Role;
  location: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
  email?: string;
  phone?: string;
  gender?: string | null;
  citizenship?: string;
}

export interface Property {
  id: number;
  title: string;
  location: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  category: string;
  description: string;
  photos: string[];
  amenities: string[];
  furnished: boolean;
  parking: boolean;
  water_included: boolean;
  electricity_included: boolean;
  deposit: number;
  available_from: string | null;
  featured: boolean;
  status: string;
  created_at: string;
  landlord: User;
  is_favorite: boolean;
  review_rating: number | null;
  review_count: number;
}

export interface PropertyList {
  items: Property[];
  total: number;
  page: number;
  page_size: number;
}

export interface PropertyInput {
  title: string;
  location: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  category: string;
  description: string;
  photos: string[];
  amenities: string[];
  furnished: boolean;
  parking: boolean;
  water_included: boolean;
  electricity_included: boolean;
  deposit: number;
  available_from: string | null;
  featured: boolean;
}

export interface Stay {
  id: number;
  title: string;
  stay_type: string;
  location: string;
  city: string;
  price: number;
  description: string;
  photos: string[];
  amenities: string[];
  rating: number;
  review_count: number;
  guests: number;
  bedrooms: number;
  created_at: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  author: User;
}

export interface Message {
  id: number;
  body: string;
  read_at: string | null;
  created_at: string;
  sender_id: number;
  recipient_id: number;
}

export interface Thread {
  user: User;
  last_message: string;
  last_at: string;
  unread: number;
}

export interface ThreadDetail {
  user: User;
  messages: Message[];
}

export interface Booking {
  id: number;
  checkin: string;
  checkout: string;
  guests: number;
  nights: number;
  total: number;
  phone: string;
  method: string;
  reference: string;
  status: string;
  created_at: string;
  stay: Stay;
}

export interface Report {
  id: number;
  category: string;
  details: string;
  status: string;
  created_at: string;
  reporter: User;
  target: User | null;
  property_id: number | null;
}

export interface Dashboard {
  user: User;
  unread_messages: number;
  stats: Record<string, number | null>;
  listings: Property[];
  favorites: Property[];
  bookings: Booking[];
  reviews: Review[];
}

export interface LandlordProfile {
  user: User;
  properties: Property[];
  reviews: Review[];
  stats: { listings: number; reviews: number; rating: number | null };
  is_me: boolean;
}

export interface AdminStats {
  users: number;
  landlords: number;
  tenants: number;
  properties: number;
  stays: number;
  bookings: number;
  reviews: number;
  open_reports: number;
  unread_messages: number;
  booking_value: number;
}

export interface PropertyFilters {
  q?: string;
  city?: string;
  property_type?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: boolean;
  sort?: string;
  page?: number;
  page_size?: number;
}
