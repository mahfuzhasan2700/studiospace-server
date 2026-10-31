import { Router } from 'express';
import * as studioController from './studio.controller.js';

const router = Router();

// Public read endpoints
router.get('/', studioController.getStudios);
router.get('/featured', studioController.getFeaturedStudios);
router.get('/:id', studioController.getStudioById);

export default router;

