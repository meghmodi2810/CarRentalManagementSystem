import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { fallbackStore } from '../config/fallbackStore.js';

export const protect = async (req, res, next) => {
  let token;

  // Check header or cookies for access token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no access token provided'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'car_rental_jwt_access_secret_super_secure_key_123456'
    );

    let user = null;
    if (isDbConnected()) {
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (e) {
        user = null;
      }
    }

    if (!user) {
      user = fallbackStore.findUserById(decoded.id);
    }

    if (!user && decoded.id) {
      // Fallback from decoded token payload
      user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'User',
        email: decoded.email,
        role: decoded.role || 'customer',
        isActive: true
      };
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists'
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid token'
    });
  }
};
