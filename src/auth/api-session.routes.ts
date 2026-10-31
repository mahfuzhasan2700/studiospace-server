import { Router, Request, Response } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from './auth.js';
import { signApiJwt, verifyApiJwt } from './jwt.js';
import { env } from '../config/env.js';

const router = Router();

// Set or refresh the API JWT in an HTTPOnly cookie based on BetterAuth session
router.post('/token', async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    if (!session || !session.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'SESSION_REQUIRED',
          message: 'An active BetterAuth session is required to obtain an API JWT token.'
        }
      });
      return;
    }

    const token = await signApiJwt({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    res.json({
      success: true,
      message: 'API JWT set in HTTPOnly cookie successfully.',
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'TOKEN_ISSUE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to issue API JWT'
      }
    });
  }
});

// Clear authentication cookies on logout
router.post('/logout', async (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  });

  res.json({
    success: true,
    message: 'Logged out successfully. HTTPOnly cookie cleared.'
  });
});

// Check current user session
router.get('/me', async (req: Request, res: Response) => {
  try {
    // 1. Try checking HTTPOnly JWT cookie
    const token = req.cookies?.token || req.cookies?.api_jwt;
    if (token) {
      const payload = await verifyApiJwt(token);
      if (payload && payload.userId) {
        res.json({
          success: true,
          data: {
            user: {
              id: payload.userId,
              email: payload.email,
              name: payload.name,
              image: payload.image || null
            }
          }
        });
        return;
      }
    }

    // 2. Fallback to BetterAuth session lookup
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    if (session && session.user) {
      res.json({
        success: true,
        data: {
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            image: session.user.image || null
          }
        }
      });
      return;
    }

    // Not authenticated
    res.json({
      success: true,
      data: {
        user: null
      }
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        user: null
      }
    });
  }
});

export default router;
