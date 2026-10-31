import { ObjectId } from 'mongodb';
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from '../../utils/errors.js';
import * as studioRepo from '../studios/studio.repository.js';
import * as bookingRepo from './booking.repository.js';
import { BookingDocument, BookingResponse } from './booking.types.js';
import { CreateBookingInput } from './booking.schema.js';
import { AuthUser } from '../../types/express.js';

export function formatBookingResponse(doc: BookingDocument): BookingResponse {
  return {
    id: doc._id.toString(),
    studioId: doc.studioId.toString(),
    studioTitle: doc.studioTitle,
    studioImage: doc.studioImage,
    studioLocation: doc.studioLocation,
    hostId: doc.hostId,
    hostEmail: doc.hostEmail,
    hostName: doc.hostName,
    customerId: doc.customerId,
    customerEmail: doc.customerEmail,
    customerName: doc.customerName,
    date: doc.date,
    startTime: doc.startTime,
    endTime: doc.endTime,
    startDateTime: doc.startDateTime.toISOString(),
    endDateTime: doc.endDateTime.toISOString(),
    durationHours: doc.durationHours,
    hourlyRateCents: doc.hourlyRateCents,
    subtotalCents: doc.subtotalCents,
    securityDepositCents: doc.securityDepositCents,
    totalPriceCents: doc.totalPriceCents,
    currency: doc.currency,
    notes: doc.notes,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString()
  };
}

export async function createBooking(
  input: CreateBookingInput,
  user: AuthUser
): Promise<BookingResponse> {
  const studio = await studioRepo.findStudioById(input.studioId);
  if (!studio) {
    throw new NotFoundError(`Studio with ID '${input.studioId}' not found`);
  }

  // Construct UTC timestamps for strict time window comparison
  const startDateTime = new Date(`${input.date}T${input.startTime}:00.000Z`);
  const endDateTime = new Date(`${input.date}T${input.endTime}:00.000Z`);

  if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    throw new ValidationError('Invalid booking date or time format provided');
  }

  const durationMs = endDateTime.getTime() - startDateTime.getTime();
  if (durationMs <= 0) {
    throw new ValidationError('Booking end time must be after start time');
  }

  const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;
  if (durationHours < 1) {
    throw new ValidationError('Minimum booking duration is 1 hour');
  }

  // Challenge 2: Concurrency & Double-Booking Prevention
  // Verify no conflicting 'Confirmed' booking exists for that studio and time slot
  const conflict = await bookingRepo.findConflictingBooking({
    studioId: studio._id,
    startDateTime,
    endDateTime
  });

  if (conflict) {
    throw new ConflictError('This time slot has already been booked. Please select another time.');
  }

  const subtotalCents = Math.round(studio.hourlyRateCents * durationHours);
  const securityDepositCents = studio.securityDepositCents || 0;
  const totalPriceCents = subtotalCents + securityDepositCents;

  const now = new Date();
  const newBooking: Omit<BookingDocument, '_id'> = {
    studioId: studio._id,
    studioTitle: studio.title,
    studioImage: studio.imageUrls[0] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    studioLocation: `${studio.address.area}, ${studio.address.city}`,
    hostId: studio.ownerId,
    hostEmail: studio.ownerEmail,
    hostName: studio.ownerName,
    customerId: user.id,
    customerEmail: user.email,
    customerName: user.name,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    startDateTime,
    endDateTime,
    durationHours,
    hourlyRateCents: studio.hourlyRateCents,
    subtotalCents,
    securityDepositCents,
    totalPriceCents,
    currency: studio.currency || 'USD',
    notes: input.notes,
    status: 'Pending',
    createdAt: now,
    updatedAt: now
  };

  const created = await bookingRepo.insertBooking(newBooking);
  return formatBookingResponse(created);
}

export async function getCustomerBookings(customerId: string): Promise<BookingResponse[]> {
  const docs = await bookingRepo.findBookingsByCustomer(customerId);
  return docs.map(formatBookingResponse);
}

export async function getHostBookings(hostId: string): Promise<BookingResponse[]> {
  const docs = await bookingRepo.findBookingsByHost(hostId);
  return docs.map(formatBookingResponse);
}

export async function cancelBooking(bookingId: string, user: AuthUser): Promise<BookingResponse> {
  const booking = await bookingRepo.findBookingById(bookingId);
  if (!booking) {
    throw new NotFoundError(`Booking with ID '${bookingId}' not found`);
  }

  // Either customer or host can cancel
  if (booking.customerId !== user.id && booking.hostId !== user.id) {
    throw new ForbiddenError('You do not have permission to cancel this booking');
  }

  if (booking.status === 'Cancelled') {
    return formatBookingResponse(booking);
  }

  if (booking.status === 'Completed') {
    throw new ValidationError('Completed bookings cannot be cancelled');
  }

  const updated = await bookingRepo.updateBookingStatus(bookingId, 'Cancelled');
  if (!updated) {
    throw new NotFoundError(`Failed to update booking status for '${bookingId}'`);
  }

  return formatBookingResponse(updated);
}

export async function confirmBooking(bookingId: string, hostUser: AuthUser): Promise<BookingResponse> {
  const booking = await bookingRepo.findBookingById(bookingId);
  if (!booking) {
    throw new NotFoundError(`Booking with ID '${bookingId}' not found`);
  }

  // Only host can confirm booking requests
  if (booking.hostId !== hostUser.id) {
    throw new ForbiddenError('Only the studio host can confirm booking requests');
  }

  if (booking.status === 'Confirmed') {
    return formatBookingResponse(booking);
  }

  // Concurrency re-check before confirming: ensure no other booking was confirmed for this exact slot
  const conflict = await bookingRepo.findConflictingBooking({
    studioId: booking.studioId,
    startDateTime: booking.startDateTime,
    endDateTime: booking.endDateTime,
    excludeBookingId: booking._id
  });

  if (conflict) {
    throw new ConflictError(
      'Cannot confirm: This time slot conflicts with an already confirmed booking on this studio.'
    );
  }

  const updated = await bookingRepo.updateBookingStatus(bookingId, 'Confirmed');
  if (!updated) {
    throw new NotFoundError(`Failed to update booking status for '${bookingId}'`);
  }

  return formatBookingResponse(updated);
}

export async function completeBooking(bookingId: string, hostUser: AuthUser): Promise<BookingResponse> {
  const booking = await bookingRepo.findBookingById(bookingId);
  if (!booking) {
    throw new NotFoundError(`Booking with ID '${bookingId}' not found`);
  }

  if (booking.hostId !== hostUser.id && booking.customerId !== hostUser.id) {
    throw new ForbiddenError('You are not authorized to mark this booking as completed');
  }

  const updated = await bookingRepo.updateBookingStatus(bookingId, 'Completed');
  if (!updated) {
    throw new NotFoundError(`Failed to update booking status for '${bookingId}'`);
  }

  return formatBookingResponse(updated);
}
