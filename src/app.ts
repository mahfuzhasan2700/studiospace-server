import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { toNodeHandler } from 'better-auth/node';
import { env } from './config/env.js';
import { getDb } from './config/db.js';
import { auth } from './auth/auth.js';
import apiSessionRoutes from './auth/api-session.routes.js';
import studioRoutes from './modules/studios/studio.routes.js';
import { requireAuth } from './middleware/require-auth.js';
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
