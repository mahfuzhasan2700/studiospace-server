import { Request, Response, NextFunction } from 'express';
import { verifyApiJwt } from '../auth/jwt.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Check HTTPOnly cookie first (as mandated by Challenge 1)
    let token = req.cookies?.token || req.cookies?.api_jwt;

    // 2. Fallback to Authorization: Bearer <token>
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. No authorization token provided in HTTPOnly cookie.'
        }
      });
      return;
    }

    const payload = await verifyApiJwt(token);

    if (!payload || !payload.userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired authorization token. Please log in again.'
        }
      });
      return;
    }

    // Attach verified user to request
    req.user = {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      image: payload.image || null
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication verification failed.'
      }
    });
  }
}
