import { Request, Response, NextFunction } from 'express';
import { studioQuerySchema } from './studio.schema.js';
import * as studioService from './studio.service.js';

export async function getStudios(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = studioQuerySchema.parse(req.query);
    const result = await studioService.getStudios(query);
    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
}

export async function getFeaturedStudios(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10) || 6, 12) : 6;
    const studios = await studioService.getFeaturedStudios(limit);
    res.json({
      success: true,
      data: studios
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudioById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const studio = await studioService.getStudioById(id);
    res.json({
      success: true,
      data: studio
    });
  } catch (error) {
    next(error);
  }
}
