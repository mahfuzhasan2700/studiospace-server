import { Collection, Filter, ObjectId, Sort } from 'mongodb';
import { getDb } from '../../config/db.js';
import { StudioDocument } from './studio.types.js';

function getCollection(): Collection<StudioDocument> {
  return getDb().collection<StudioDocument>('studios');
}

export interface StudioFilterOptions {
  category?: string;
  search?: string;
  city?: string;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating-desc';
  page: number;
  limit: number;
}

export async function findStudios(options: StudioFilterOptions): Promise<{ items: StudioDocument[]; total: number }> {
  const collection = getCollection();
  const filter: Filter<StudioDocument> = {};

  if (options.category) {
    filter.category = options.category as StudioDocument['category'];
  }

  if (options.city) {
    filter['address.city'] = { $regex: new RegExp(options.city, 'i') };
  }

  if (options.search) {
    const escapedSearch = options.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: new RegExp(escapedSearch, 'i') } },
      { overview: { $regex: new RegExp(escapedSearch, 'i') } },
      { 'address.area': { $regex: new RegExp(escapedSearch, 'i') } },
      { 'address.city': { $regex: new RegExp(escapedSearch, 'i') } }
    ];
  }

  let sort: Sort = { createdAt: -1, _id: -1 };
  if (options.sort === 'price-asc') {
    sort = { hourlyRateCents: 1, _id: -1 };
  } else if (options.sort === 'price-desc') {
    sort = { hourlyRateCents: -1, _id: -1 };
  } else if (options.sort === 'rating-desc') {
    sort = { rating: -1, createdAt: -1, _id: -1 };
  }

  const skip = (options.page - 1) * options.limit;

  const [items, total] = await Promise.all([
    collection.find(filter).sort(sort).skip(skip).limit(options.limit).toArray(),
    collection.countDocuments(filter)
  ]);

  return { items, total };
}

export async function findFeaturedStudios(limit = 6): Promise<StudioDocument[]> {
  const collection = getCollection();
  // Fetch newest or top-rated studios using .limit(6) as strictly required
  return collection
    .find({})
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function findStudioById(id: string): Promise<StudioDocument | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = getCollection();
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function insertStudio(doc: Omit<StudioDocument, '_id'>): Promise<StudioDocument> {
  const collection = getCollection();
  const result = await collection.insertOne(doc as any);
  return { ...doc, _id: result.insertedId } as StudioDocument;
}

