import { Request, Response, NextFunction } from 'express';
import { createBookingSchema } from './booking.schema.js';
import * as bookingService from './booking.service.js';
import { UnauthorizedError } from '../../utils/errors.js';

export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required to book a studio');
    }
    const input = createBookingSchema.parse(req.body);
    const booking = await bookingService.createBooking(input, req.user);
    res.status(201).json({
      success: true,
      message: 'Booking request placed successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required to view your bookings');
    }
    const bookings = await bookingService.getCustomerBookings(req.user.id);
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
}

export async function getHostBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required to view host booking requests');
    }
    const bookings = await bookingService.getHostBookings(req.user.id);
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required to cancel a booking');
    }
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const booking = await bookingService.cancelBooking(id, req.user);
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
}

export async function confirmBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required to confirm a booking');
    }
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const booking = await bookingService.confirmBooking(id, req.user);
    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
}

export async function completeBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required to complete a booking');
    }
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const booking = await bookingService.completeBooking(id, req.user);
    res.json({
      success: true,
      message: 'Booking marked as completed',
      data: booking
    });
  } catch (error) {
    next(error);
  }
}
