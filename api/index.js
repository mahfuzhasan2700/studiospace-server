import app from '../dist/app.js';
import { connectDb } from '../dist/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDb();
  } catch (error) {
    console.error('MongoDB serverless connection error:', error);
  }
  return app(req, res);
}

