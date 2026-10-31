import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { getDb } from './config/db.js';
import studioRoutes from './modules/studios/studio.routes.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

// Security and CORS configuration
app.use(
  cors({
    origin: [env.CLIENT_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
  })
);

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

app.get('/api/ready', async (req, res) => {
  try {
    const db = getDb();
    await db.command({ ping: 1 });
    res.json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unavailable',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Database ping failed'
    });
  }
});

// Parsers for standard API routes
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// Business API Routers
app.use('/api/studios', studioRoutes);

// Catch 404 for unmatched API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`
    }
  });
});

// Central error handling middleware
app.use(errorHandler);

export default app;
