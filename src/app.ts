import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { toNodeHandler } from 'better-auth/node';
import { env } from './config/env.js';
import { getDb } from './config/db.js';
import { auth } from './auth/auth.js';
import apiSessionRoutes from './auth/api-session.routes.js';
import studioRoutes from './modules/studios/studio.routes.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
import * as studioController from './modules/studios/studio.controller.js';
import { requireAuth } from './middleware/require-auth.js';

import { errorHandler } from './middleware/error-handler.js';

const app = express();

// Security and CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin === env.CLIENT_ORIGIN ||
        origin.includes('localhost') ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
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

app.get('/api/health/diagnostics', async (req, res) => {
  try {
    const db = getDb();
    const start = Date.now();
    await db.command({ ping: 1 });
    const latencyMs = Date.now() - start;

    const [studioCount, bookingCount, userCount] = await Promise.all([
      db.collection('studios').countDocuments().catch(() => 0),
      db.collection('bookings').countDocuments().catch(() => 0),
      db.collection('user').countDocuments().catch(() => 0)
    ]);

    res.json({
      success: true,
      service: 'StudioSpace Backend API',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
      database: {
        status: 'connected',
        name: env.MONGODB_DB_NAME,
        latencyMs,
        collections: {
          studios: studioCount,
          bookings: bookingCount,
          users: userCount
        }
      },
      system: {
        nodeVersion: process.version,
        memoryUsageMb: Math.round(process.memoryUsage().rss / (1024 * 1024))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Diagnostic probe failed'
    });
  }
});


// CRITICAL: Mount BetterAuth handler BEFORE express.json()
// BetterAuth needs direct access to the incoming HTTP request stream
app.all('/api/auth/*', toNodeHandler(auth));

// Body and Cookie Parsers for application routes
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// Session and JWT routes (Challenge 1)
app.use('/api/session', apiSessionRoutes);

// Business API Routers
app.use('/api/studios', studioRoutes);
app.use('/api/bookings', bookingRoutes);
app.get('/api/me/studios', requireAuth, studioController.getMyStudios);


// Protected route verification test endpoint
app.get('/api/me/verify-token', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Authorized! Token verified successfully.',
    user: req.user
  });
});

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
