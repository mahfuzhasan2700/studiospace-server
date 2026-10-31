import { z } from 'zod';

export const createBookingSchema = z
  .object({
    studioId: z.string().min(1, 'Studio ID is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format'),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional()
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'End time must be later than start time',
    path: ['endTime']
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateBookingStatusSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Completed', 'Cancelled'], {
    errorMap: () => ({ message: 'Invalid booking status' })
  })
});

export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;

