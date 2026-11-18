import express from 'express';
import { body } from 'express-validator';
import {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  toggleLikeCar,
  getSavedCars
} from '../controllers/carController.js';
import {
  getCarMessages,
  postCarMessage,
  replyCarMessage
} from '../controllers/carMessageController.js';
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

// Car browsing routes
router.get('/', getCars);
router.get('/saved', protect, getSavedCars);
router.get('/:id', getCarById);

// Car Discussions & Inquiries (Customer contacting vehicle owner via post)
router.get('/:id/messages', getCarMessages);
router.post('/:id/messages', protect, postCarMessage);
router.post('/:id/messages/:messageId/reply', protect, replyCarMessage);

// Like & Save car for later
router.post('/:id/like', protect, toggleLikeCar);

// Add vehicle to give on rent (Authenticated users, hosts, agents, admins)
router.post(
  '/',
  protect,
  carValidation,
  validateRequest,
  createCar
);

// Update vehicle
router.put(
  '/:id',
  protect,
  carValidation,
  validateRequest,
  updateCar
);

// Delete vehicle (Owner or Admin)
router.delete(
  '/:id',
  protect,
  deleteCar
);

export default router;
