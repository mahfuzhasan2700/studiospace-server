import { ObjectId } from 'mongodb';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface BookingDocument {
  _id: ObjectId;
  studioId: ObjectId;
  studioTitle: string;
  studioImage: string;
  studioLocation: string;
  hostId: string;
  hostEmail: string;
  hostName: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  startDateTime: Date;
  endDateTime: Date;
  durationHours: number;
  hourlyRateCents: number;
  subtotalCents: number;
  securityDepositCents: number;
  totalPriceCents: number;
  currency: string;
  notes?: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingResponse {
  id: string;
  studioId: string;
  studioTitle: string;
  studioImage: string;
  studioLocation: string;
  hostId: string;
  hostEmail: string;
  hostName: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  date: string;
  startTime: string;
  endTime: string;
  startDateTime: string;
  endDateTime: string;
  durationHours: number;
  hourlyRateCents: number;
  subtotalCents: number;
  securityDepositCents: number;
  totalPriceCents: number;
  currency: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

