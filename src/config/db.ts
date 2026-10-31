import { MongoClient, Db } from 'mongodb';
import { env } from './env.js';

export const client = new MongoClient(env.MONGODB_URI, {
  maxPoolSize: 20,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000
});

export const db: Db = client.db(env.MONGODB_DB_NAME);

let isConnected = false;

export async function connectDb(): Promise<Db> {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
    console.log(`Connected to MongoDB database: ${env.MONGODB_DB_NAME}`);
  }
  return db;
}


export function getDb(): Db {
  return db;
}

export function getClient(): MongoClient {
  return client;
}

export async function closeDb(): Promise<void> {
  await client.close();
  console.log('MongoDB connection closed.');
}
