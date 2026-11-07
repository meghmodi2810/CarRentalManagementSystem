import express from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  updateProfile,
  updateUserStatus
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validatorMiddleware.js';

const router = express.Router();

router.use(protect);

// Current user profile update
router.put(
  '/profile',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')
  ],
  validateRequest,
  updateProfile
);

// Admin-only endpoints
router.get('/', authorizeRoles('admin'), getUsers);
router.patch(
  '/:id/status',
  authorizeRoles('admin'),
  [
    body('role').optional().isIn(['customer', 'admin', 'agent']).withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
  ],
  validateRequest,
  updateUserStatus
);

export default router;

