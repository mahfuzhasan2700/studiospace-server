import { NotFoundError, ForbiddenError } from '../../utils/errors.js';
import * as studioRepo from './studio.repository.js';
import { StudioDocument, StudioSummaryResponse, StudioDetailResponse } from './studio.types.js';
import { CreateStudioInput, UpdateStudioInput } from './studio.schema.js';
import { AuthUser } from '../../types/express.js';


export function formatStudioSummary(doc: StudioDocument): StudioSummaryResponse {
  return {
    id: doc._id.toString(),
    title: doc.title,
    category: doc.category,
    hourlyRateCents: doc.hourlyRateCents,
    securityDepositCents: doc.securityDepositCents || 0,
    currency: doc.currency || 'USD',
    maxCapacity: doc.maxCapacity,
    address: doc.address,
    imageUrl: doc.imageUrls[0] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    imageUrls: doc.imageUrls || [],
    amenities: doc.amenities || [],
    rating: typeof doc.rating === 'number' ? doc.rating : null,
    reviewCount: doc.reviewCount || 0,
    location: `${doc.address.area}, ${doc.address.city}`,
    createdAt: doc.createdAt.toISOString()
  };
}

export function formatStudioDetail(doc: StudioDocument): StudioDetailResponse {
  return {
    ...formatStudioSummary(doc),
    overview: doc.overview,
    timezone: doc.timezone || 'Asia/Dhaka',
    operatingHours: doc.operatingHours || {},
    host: {
      name: doc.ownerName || 'Studio Host',
      image: doc.ownerImage || null
    },
    updatedAt: doc.updatedAt.toISOString()
  };
}

export async function getStudios(query: studioRepo.StudioFilterOptions) {
  const { items, total } = await studioRepo.findStudios(query);
  const data = items.map(formatStudioSummary);
  return {
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1
    }
  };
}

export async function getFeaturedStudios(limit = 6): Promise<StudioSummaryResponse[]> {
  const items = await studioRepo.findFeaturedStudios(limit);
  return items.map(formatStudioSummary);
}

export async function getStudioById(id: string): Promise<StudioDetailResponse> {
  const doc = await studioRepo.findStudioById(id);
  if (!doc) {
    throw new NotFoundError(`Studio with ID '${id}' not found`);
  }
  return formatStudioDetail(doc);
}

export async function createStudio(input: CreateStudioInput, user: AuthUser): Promise<StudioDetailResponse> {
  const now = new Date();
  const newStudio: Omit<StudioDocument, '_id'> = {
    ...input,
    ownerId: user.id,
    ownerEmail: user.email,
    ownerName: user.name,
    ownerImage: user.image || undefined,
    availabilityVersion: 1,
    rating: 5.0,
    reviewCount: 0,
    createdAt: now,
    updatedAt: now
  };

  const created = await studioRepo.insertStudio(newStudio);
  return formatStudioDetail(created);
}

export async function getStudiosByOwner(ownerId: string): Promise<StudioSummaryResponse[]> {
  const items = await studioRepo.findStudiosByOwner(ownerId);
  return items.map(formatStudioSummary);
}

export async function updateStudio(
  id: string,
  input: UpdateStudioInput,
  user: AuthUser
): Promise<StudioDetailResponse> {
  const existing = await studioRepo.findStudioById(id);
  if (!existing) {
    throw new NotFoundError(`Studio with ID '${id}' not found`);
  }

  if (existing.ownerId !== user.id) {
    throw new ForbiddenError('You are not authorized to update this studio listing');
  }

  const updated = await studioRepo.updateStudio(id, input);
  if (!updated) {
    throw new NotFoundError(`Failed to update studio '${id}'`);
  }

  return formatStudioDetail(updated);
}

export async function deleteStudio(id: string, user: AuthUser): Promise<void> {
  const existing = await studioRepo.findStudioById(id);
  if (!existing) {
    throw new NotFoundError(`Studio with ID '${id}' not found`);
  }

  if (existing.ownerId !== user.id) {
    throw new ForbiddenError('You are not authorized to delete this studio listing');
  }

  const deleted = await studioRepo.deleteStudio(id);
  if (!deleted) {
    throw new NotFoundError(`Failed to delete studio '${id}'`);
  }
}


