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
    const cleanEmail = (email || '').trim().toLowerCase();

    let existingUser = null;
    if (isDbConnected()) {
      try {
        existingUser = await User.findOne({ email: cleanEmail });
      } catch (err) {
        existingUser = null;
      }
    }
    if (!existingUser) {
      existingUser = fallbackStore.findUserByEmail(cleanEmail);
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

    // Always persist to local store first
    const storeUser = await fallbackStore.createUser({
      name,
      email: cleanEmail,
      password,
      role: assignedRole,
      phone: phone || '',
      drivingLicenseNumber: drivingLicenseNumber || ''
    });

    let dbUser = null;
    if (isDbConnected()) {
      try {
        dbUser = await User.create({
          name,
          email: cleanEmail,
          password,
          role: assignedRole,
          phone: phone || '',
          drivingLicenseNumber: drivingLicenseNumber || ''
        });
      } catch (dbErr) {
        console.log('[Auth] DB write failed, using persistent local store:', dbErr.message);
      }
    }

    const activeUser = dbUser || storeUser;
    const accessToken = generateAccessToken(activeUser);
    const refreshToken = generateRefreshToken(activeUser);

    if (dbUser) {
      try {
        dbUser.refreshToken = refreshToken;
        await dbUser.save({ validateBeforeSave: false });
      } catch (e) {}
    }

    res.cookie('refreshToken', refreshToken, cookieOptions);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      accessToken,
      refreshToken,
      user: {
        id: activeUser._id,
        name: activeUser.name,
        email: activeUser.email,
        role: activeUser.role,
        phone: activeUser.phone,
        drivingLicenseNumber: activeUser.drivingLicenseNumber
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
    const cleanEmail = (email || '').trim().toLowerCase();

    let user = null;
    let isMatch = false;

    // 1. Try DB first if connected
    if (isDbConnected()) {
      try {
        const dbCandidate = await User.findOne({ email: cleanEmail }).select('+password +refreshToken');
        if (dbCandidate) {
          const match = await dbCandidate.matchPassword(password);
          if (match) {
            user = dbCandidate;
            isMatch = true;
          }
        }
      } catch (err) {
        // Fallback
      }
    }

    // 2. If not matched in DB, check persistent local store
    if (!user || !isMatch) {
      const storeCandidate = fallbackStore.findUserByEmail(cleanEmail);
      if (storeCandidate) {
        const match = await bcrypt.compare(password, storeCandidate.password);
        if (match) {
          user = storeCandidate;
          isMatch = true;

          // Asynchronously sync to MongoDB if DB is connected but didn't have user yet
          if (isDbConnected()) {
            try {
              const existingInDb = await User.findOne({ email: cleanEmail });
              if (!existingInDb) {
                await User.create({
                  _id: storeCandidate._id,
                  name: storeCandidate.name,
                  email: storeCandidate.email,
                  password: password,
                  role: storeCandidate.role,
                  phone: storeCandidate.phone,
                  drivingLicenseNumber: storeCandidate.drivingLicenseNumber
                });
              }
            } catch (syncErr) {
              // Ignore background sync error
            }
          }
        }
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
        phone: user.phone || '',
        drivingLicenseNumber: user.drivingLicenseNumber || ''
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
