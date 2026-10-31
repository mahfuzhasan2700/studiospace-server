import { NotFoundError } from '../../utils/errors.js';
import * as studioRepo from './studio.repository.js';
import { StudioDocument, StudioSummaryResponse, StudioDetailResponse } from './studio.types.js';

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
