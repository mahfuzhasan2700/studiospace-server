import { Db } from 'mongodb';

export async function initIndexes(db: Db): Promise<void> {
  const studios = db.collection('studios');
  const bookings = db.collection('bookings');
  const reviews = db.collection('reviews');

  // Studios indexes
  await studios.createIndex({ ownerId: 1, createdAt: -1 });
  await studios.createIndex({ category: 1, createdAt: -1 });
  await studios.createIndex({ createdAt: -1 });
  await studios.createIndex({ hourlyRateCents: 1 });
  await studios.createIndex(
    { title: 'text', overview: 'text', 'address.city': 'text', 'address.area': 'text' },
    { name: 'studio_text_search', weights: { title: 10, 'address.city': 5, overview: 2 } }
  );

  // Bookings indexes
  await bookings.createIndex({ studioId: 1, status: 1, startAt: 1, endAt: 1 });
  await bookings.createIndex({ customerId: 1, createdAt: -1 });
  await bookings.createIndex({ hostId: 1, createdAt: -1 });

  // Reviews indexes
  await reviews.createIndex({ studioId: 1, createdAt: -1 });

  console.log('MongoDB collection indexes initialized successfully.');
}

