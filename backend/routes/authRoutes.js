import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  refreshToken,
  getMe,
  logout
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { validateRequest } from '../middleware/validatorMiddleware.js';

const router = express.Router();

// Register route with express-validator validation and rate limiter
router.post(
  '/register',
  authRateLimiter,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('phone')
      .optional()
      .trim(),
    body('drivingLicenseNumber')
      .optional()
      .trim()
  ],
  validateRequest,
  register
);

// Login route with express-validator validation and rate limiter
router.post(
  '/login',
  authRateLimiter,
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  validateRequest,
  login
);

// Refresh Token route with rate limiter
router.post('/refresh-token', authRateLimiter, refreshToken);

// Get current user profile (protected)
router.get('/me', protect, getMe);

// Logout (protected)
router.post('/logout', protect, logout);

export default router;

