import express from 'express';
import { body } from 'express-validator';
import {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar
} from '../controllers/carController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validatorMiddleware.js';

const router = express.Router();

const carValidation = [
  body('make').trim().notEmpty().withMessage('Make is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year')
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage('Provide a valid year'),
  body('licensePlate').trim().notEmpty().withMessage('License plate is required'),
  body('category')
    .isIn(['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Electric', 'Van'])
    .withMessage('Valid category is required'),
  body('seatingCapacity')
    .isInt({ min: 1, max: 15 })
    .withMessage('Seating capacity must be between 1 and 15'),
  body('dailyRate')
    .isFloat({ min: 0 })
    .withMessage('Daily rate must be a positive number'),
  body('location').trim().notEmpty().withMessage('Location is required')
];

// Public routes
router.get('/', getCars);
router.get('/:id', getCarById);

// Admin / Agent protected routes
router.post(
  '/',
  protect,
  authorizeRoles('admin', 'agent'),
  carValidation,
  validateRequest,
  createCar
);

router.put(
  '/:id',
  protect,
  authorizeRoles('admin', 'agent'),
  carValidation,
  validateRequest,
  updateCar
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('admin'),
  deleteCar
);

export default router;

