import { Router } from 'express';
import * as bookingController from './booking.controller.js';
import { requireAuth } from '../../middleware/require-auth.js';

const router = Router();

// All booking routes require authentication (Challenge 1: HTTPOnly JWT)
router.use(requireAuth);

router.post('/', bookingController.createBooking);
router.get('/my', bookingController.getMyBookings);
router.get('/host', bookingController.getHostBookings);
router.patch('/:id/cancel', bookingController.cancelBooking);
router.patch('/:id/confirm', bookingController.confirmBooking);
router.patch('/:id/complete', bookingController.completeBooking);

export default router;
