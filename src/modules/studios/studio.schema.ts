import { z } from 'zod';

export const studioCategories = [
  'photo-studio',
  'film-stage',
  'podcast-lounge',
  'music-suite',
  'workshop'
] as const;

export const studioQuerySchema = z.object({
  category: z.enum(studioCategories).optional(),
  search: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  sort: z.enum(['newest', 'price-asc', 'price-desc', 'rating-desc']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12)
});

export type StudioQueryInput = z.infer<typeof studioQuerySchema>;

const timeIntervalSchema = z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format'),
  end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format')
}).refine(data => data.start < data.end, {
  message: 'End time must be later than start time',
  path: ['end']
});

const operatingHoursSchema = z.object({
  monday: z.array(timeIntervalSchema).optional(),
  tuesday: z.array(timeIntervalSchema).optional(),
  wednesday: z.array(timeIntervalSchema).optional(),
  thursday: z.array(timeIntervalSchema).optional(),
  friday: z.array(timeIntervalSchema).optional(),
  saturday: z.array(timeIntervalSchema).optional(),
  sunday: z.array(timeIntervalSchema).optional()
}).optional().default({});

export const createStudioSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  category: z.enum(studioCategories, { errorMap: () => ({ message: 'Invalid studio category' }) }),
  hourlyRateCents: z.number().int().positive('Hourly rate must be a positive number'),
  securityDepositCents: z.number().int().nonnegative('Security deposit cannot be negative').default(0),
  currency: z.string().length(3).default('USD'),
  maxCapacity: z.number().int().positive('Capacity must be at least 1 person').max(200),
  address: z.object({
    line1: z.string().trim().min(3, 'Street address is required'),
    area: z.string().trim().min(2, 'Area/neighborhood is required'),
    city: z.string().trim().min(2, 'City is required'),
    country: z.string().trim().min(2, 'Country code is required')
  }),
  imageUrls: z.array(z.string().url('Must be a valid URL')).min(1, 'At least one studio image is required').max(10),
  amenities: z.array(z.string().trim().min(1)).min(1, 'Select at least one amenity').max(30),
  overview: z.string().trim().min(20, 'Overview must be at least 20 characters').max(2000),
  timezone: z.string().default('Asia/Dhaka'),
  operatingHours: operatingHoursSchema,
  unavailablePeriods: z.array(
    z.object({
      startAt: z.coerce.date(),
      endAt: z.coerce.date(),
      reason: z.string().optional()
    })
  ).default([])
});

export type CreateStudioInput = z.infer<typeof createStudioSchema>;

