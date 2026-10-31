import { Collection, Filter, ObjectId } from 'mongodb';
import { getDb } from '../../config/db.js';
import { BookingDocument } from './booking.types.js';

function getCollection(): Collection<BookingDocument> {
  return getDb().collection<BookingDocument>('bookings');
}

export interface ConflictingBookingParams {
  studioId: ObjectId;
  startDateTime: Date;
  endDateTime: Date;
  excludeBookingId?: ObjectId;
}

export async function findConflictingBooking(
  params: ConflictingBookingParams
): Promise<BookingDocument | null> {
  const collection = getCollection();

  const filter: Filter<BookingDocument> = {
    studioId: params.studioId,
    status: 'Confirmed',
    startDateTime: { $lt: params.endDateTime },
    endDateTime: { $gt: params.startDateTime }
  };

  if (params.excludeBookingId) {
    filter._id = { $ne: params.excludeBookingId };
  }

  return collection.findOne(filter);
}

export async function insertBooking(
  doc: Omit<BookingDocument, '_id'>
): Promise<BookingDocument> {
  const collection = getCollection();
  const result = await collection.insertOne(doc as any);
  return { ...doc, _id: result.insertedId } as BookingDocument;
}

export async function findBookingById(id: string): Promise<BookingDocument | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = getCollection();
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function findBookingsByCustomer(customerId: string): Promise<BookingDocument[]> {
  const collection = getCollection();
  return collection
    .find({ customerId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function findBookingsByHost(hostId: string): Promise<BookingDocument[]> {
  const collection = getCollection();
  return collection
    .find({ hostId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function updateBookingStatus(
  id: string,
  status: BookingDocument['status']
): Promise<BookingDocument | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = getCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        status,
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  );
  return result;
}

