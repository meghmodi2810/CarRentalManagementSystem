import express from 'express';
import { body } from 'express-validator';
import {
  createRental,
  getMyRentals,
  getAllRentals,
  getRentalById,
  updateRentalStatus
} from '../controllers/rentalController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validatorMiddleware.js';

const router = express.Router();

const rentalValidation = [
  body('carId').isMongoId().withMessage('Valid car ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
];

// All rental routes are protected
router.use(protect);

// Customer endpoints
router.post('/', rentalValidation, validateRequest, createRental);
router.get('/my-rentals', getMyRentals);

// Admin / Agent endpoints
router.get('/', authorizeRoles('admin', 'agent'), getAllRentals);

// Detail and status update
router.get('/:id', getRentalById);
router.patch(
  '/:id/status',
  [
    body('status')
      .isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled'])
      .withMessage('Valid rental status is required')
  ],
  validateRequest,
  updateRentalStatus
);

export default router;

