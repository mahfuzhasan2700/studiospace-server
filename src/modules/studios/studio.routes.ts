import { Router } from 'express';
import * as studioController from './studio.controller.js';
import { requireAuth } from '../../middleware/require-auth.js';

const router = Router();

// Public read endpoints
router.get('/', studioController.getStudios);
router.get('/featured', studioController.getFeaturedStudios);

// Host private listings endpoints (must come before /:id)
router.get('/my/listings', requireAuth, studioController.getMyStudios);
router.get('/me', requireAuth, studioController.getMyStudios);

// Public single studio read
router.get('/:id', studioController.getStudioById);

// Host mutations (Protected by Challenge 1 HTTPOnly cookie auth)
router.post('/', requireAuth, studioController.createStudio);
router.patch('/:id', requireAuth, studioController.updateStudio);
router.delete('/:id', requireAuth, studioController.deleteStudio);

export default router;


