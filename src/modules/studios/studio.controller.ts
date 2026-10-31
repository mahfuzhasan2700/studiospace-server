import { Request, Response, NextFunction } from 'express';
import { studioQuerySchema, createStudioSchema, updateStudioSchema } from './studio.schema.js';
import * as studioService from './studio.service.js';
import { UnauthorizedError } from '../../utils/errors.js';


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

export async function createStudio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required to create a studio listing');
    }
    const input = createStudioSchema.parse(req.body);
    const created = await studioService.createStudio(input, req.user);
    res.status(201).json({
      success: true,
      message: 'Studio listing created successfully',
      data: created
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyStudios(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required to view your studio listings');
    }
    const studios = await studioService.getStudiosByOwner(req.user.id);
    res.json({
      success: true,
      data: studios
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStudio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required to update a studio listing');
    }
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const input = updateStudioSchema.parse(req.body);
    const updated = await studioService.updateStudio(id, input, req.user);
    res.json({
      success: true,
      message: 'Studio listing updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteStudio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required to delete a studio listing');
    }
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    await studioService.deleteStudio(id, req.user);
    res.json({
      success: true,
      message: 'Studio listing deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

