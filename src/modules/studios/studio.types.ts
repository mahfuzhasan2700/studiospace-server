import { ObjectId } from 'mongodb';

export type StudioCategory =
  | 'photo-studio'
  | 'film-stage'
  | 'podcast-lounge'
  | 'music-suite'
  | 'workshop';

export interface StudioAddress {
  line1: string;
  area: string;
  city: string;
  country: string;
}

export interface TimeInterval {
  start: string; // HH:mm format, e.g. "09:00"
  end: string;   // HH:mm format, e.g. "18:00"
}

export type OperatingHours = {
  [day in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']?: TimeInterval[];
};

export interface UnavailablePeriod {
  startAt: Date;
  endAt: Date;
  reason?: string;
}

export interface StudioDocument {
  _id: ObjectId;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  ownerImage?: string;
  title: string;
  category: StudioCategory;
  hourlyRateCents: number;
  securityDepositCents: number;
  currency: string;
  maxCapacity: number;
  address: StudioAddress;
  imageUrls: string[];
  amenities: string[];
  overview: string;
  timezone: string;
  operatingHours: OperatingHours;
  unavailablePeriods: UnavailablePeriod[];
  availabilityVersion: number;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudioSummaryResponse {
  id: string;
  title: string;
  category: StudioCategory;
  hourlyRateCents: number;
  securityDepositCents: number;
  currency: string;
  maxCapacity: number;
  address: StudioAddress;
  imageUrl: string;
  imageUrls: string[];
  amenities: string[];
  rating: number | null;
  reviewCount: number;
  location: string;
  createdAt: string;
}

export interface StudioDetailResponse extends StudioSummaryResponse {
  overview: string;
  timezone: string;
  operatingHours: OperatingHours;
  host: {
    name: string;
    image: string | null;
    email?: string;
  };
  updatedAt: string;
}
