import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { fallbackStore } from '../config/fallbackStore.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        return res.status(200).json({
          success: true,
          count: users.length,
          data: users
        });
      } catch (e) {
        // Fallback
      }
    }

    const safeUsers = fallbackStore.users.map(({ password, ...u }) => u);
    res.status(200).json({
      success: true,
      count: safeUsers.length,
      data: safeUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, drivingLicenseNumber } = req.body;
    const userId = req.user.id || req.user._id;

    if (isDbConnected()) {
      try {
        const user = await User.findById(userId);
        if (user) {
          if (name) user.name = name;
          if (phone !== undefined) user.phone = phone;
          if (drivingLicenseNumber !== undefined) user.drivingLicenseNumber = drivingLicenseNumber;

          const updatedUser = await user.save();
          return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
              id: updatedUser._id,
              name: updatedUser.name,
              email: updatedUser.email,
              role: updatedUser.role,
              phone: updatedUser.phone,
              drivingLicenseNumber: updatedUser.drivingLicenseNumber
            }
          });
        }
      } catch (e) {
        // Fallback
      }
    }

    const updated = fallbackStore.updateUserProfile(userId, { name, phone, drivingLicenseNumber });
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updated?._id || userId,
        name: updated?.name || name,
        email: updated?.email || req.user.email,
        role: updated?.role || req.user.role,
        phone: updated?.phone || phone,
        drivingLicenseNumber: updated?.drivingLicenseNumber || drivingLicenseNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status / role (Admin)
// @route   PATCH /api/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive, role } = req.body;
    const user = isDbConnected() ? await User.findById(req.params.id) : fallbackStore.findUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (isDbConnected() && user.save) {
      if (isActive !== undefined) user.isActive = isActive;
      if (role && ['customer', 'admin', 'agent'].includes(role)) user.role = role;
      await user.save();
    } else {
      if (isActive !== undefined) user.isActive = isActive;
      if (role && ['customer', 'admin', 'agent'].includes(role)) user.role = role;
    }

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};
