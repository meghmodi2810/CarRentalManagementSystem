import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js';
import { isDbConnected } from '../config/db.js';
import { fallbackStore } from '../config/fallbackStore.js';

// Cookie options for refresh token
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, drivingLicenseNumber } = req.body;

    let user;
    let existingUser;

    if (isDbConnected()) {
      try {
        existingUser = await User.findOne({ email });
      } catch (err) {
        existingUser = fallbackStore.findUserByEmail(email);
      }
    } else {
      existingUser = fallbackStore.findUserByEmail(email);
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists'
      });
    }

    let assignedRole = 'customer';
    if (role && ['customer', 'agent'].includes(role)) {
      assignedRole = role;
    }

    if (isDbConnected()) {
      try {
        user = await User.create({
          name,
          email,
          password,
          role: assignedRole,
          phone: phone || '',
          drivingLicenseNumber: drivingLicenseNumber || ''
        });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        res.cookie('refreshToken', refreshToken, cookieOptions);

        return res.status(201).json({
          success: true,
          message: 'Registration successful',
          accessToken,
          refreshToken,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            drivingLicenseNumber: user.drivingLicenseNumber
          }
        });
      } catch (dbErr) {
        // Fallback to dynamic store if DB write fails
        console.log('[Auth] DB write failed, using fallback store');
      }
    }

    // Dynamic Store creation
    user = await fallbackStore.createUser({
      name,
      email,
      password,
      role: assignedRole,
      phone: phone || '',
      drivingLicenseNumber: drivingLicenseNumber || ''
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        drivingLicenseNumber: user.drivingLicenseNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get tokens
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user = null;
    let isMatch = false;

    if (isDbConnected()) {
      try {
        user = await User.findOne({ email }).select('+password +refreshToken');
        if (user) {
          isMatch = await user.matchPassword(password);
        }
      } catch (err) {
        user = null;
      }
    }

    if (!user) {
      user = fallbackStore.findUserByEmail(email);
      if (user) {
        isMatch = await bcrypt.compare(password, user.password);
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact support.'
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    if (isDbConnected() && user.save) {
      try {
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
      } catch (e) {
        // Continue
      }
    }

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        drivingLicenseNumber: user.drivingLicenseNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.body.refreshToken || (req.cookies && req.cookies.refreshToken);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || 'car_rental_jwt_refresh_secret_super_secure_key_654321'
      );
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    let user = null;
    if (isDbConnected()) {
      try {
        user = await User.findById(decoded.id).select('+refreshToken');
      } catch (e) {
        user = null;
      }
    }

    if (!user) {
      user = fallbackStore.findUserById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token session'
      });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged-in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    let user = null;
    if (isDbConnected()) {
      try {
        user = await User.findById(req.user.id || req.user._id);
      } catch (e) {
        user = null;
      }
    }
    if (!user) {
      user = fallbackStore.findUserById(req.user.id || req.user._id);
    }

    res.status(200).json({
      success: true,
      user: user || req.user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear refresh token
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    if (req.user && isDbConnected()) {
      try {
        await User.findByIdAndUpdate(req.user.id || req.user._id, { refreshToken: null });
      } catch (e) {
        // Continue
      }
    }
    res.clearCookie('refreshToken');
    res.status(200).json({
      success: true,
      message: 'Successfully logged out'
    });
  } catch (error) {
    next(error);
  }
};
