import Rental from '../models/Rental.js';
import Car from '../models/Car.js';
import { isDbConnected } from '../config/db.js';
import { fallbackStore } from '../config/fallbackStore.js';

// @desc    Create a new rental booking
// @route   POST /api/rentals
// @access  Private (Customer / Admin)
export const createRental = async (req, res, next) => {
  try {
    const { carId, startDate, endDate, pickupLocation, dropoffLocation, notes } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    let car = null;
    if (isDbConnected()) {
      try {
        car = await Car.findById(carId);
      } catch (e) {
        car = null;
      }
    }
    if (!car) {
      car = fallbackStore.getCarById(carId);
    }

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    if (car.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Car is currently ${car.status} and cannot be booked`
      });
    }

    // Calculate days and total amount
    const diffTime = Math.abs(end - start);
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalAmount = totalDays * car.dailyRate;

    if (isDbConnected()) {
      try {
        const rental = await Rental.create({
          customer: req.user.id || req.user._id,
          car: carId,
          startDate: start,
          endDate: end,
          totalDays,
          dailyRate: car.dailyRate,
          totalAmount,
          status: 'confirmed',
          pickupLocation: pickupLocation || car.location,
          dropoffLocation: dropoffLocation || car.location,
          notes: notes || '',
          paymentStatus: 'paid'
        });

        const populatedRental = await Rental.findById(rental._id)
          .populate('car')
          .populate('customer', 'name email phone drivingLicenseNumber');

        return res.status(201).json({
          success: true,
          message: 'Rental booking created successfully',
          data: populatedRental
        });
      } catch (dbErr) {
        // Fallback to store
      }
    }

    const rental = fallbackStore.createRental({
      customer: req.user,
      car: car,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalDays,
      dailyRate: car.dailyRate,
      totalAmount,
      pickupLocation: pickupLocation || car.location,
      dropoffLocation: dropoffLocation || car.location,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Rental booking created successfully',
      data: rental
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rentals for currently logged-in user
// @route   GET /api/rentals/my-rentals
// @access  Private (Customer)
export const getMyRentals = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    if (isDbConnected()) {
      try {
        const rentals = await Rental.find({ customer: userId })
          .populate('car')
          .sort({ createdAt: -1 });

        return res.status(200).json({
          success: true,
          count: rentals.length,
          data: rentals
        });
      } catch (e) {
        // Fallback
      }
    }

    const rentals = fallbackStore.getUserRentals(userId);
    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rentals (Admin / Agent)
// @route   GET /api/rentals
// @access  Private (Admin / Agent)
export const getAllRentals = async (req, res, next) => {
  try {
    const { status, carId } = req.query;

    if (isDbConnected()) {
      try {
        const filter = {};
        if (status) filter.status = status;
        if (carId) filter.car = carId;

        const rentals = await Rental.find(filter)
          .populate('customer', 'name email phone drivingLicenseNumber')
          .populate('car')
          .sort({ createdAt: -1 });

        return res.status(200).json({
          success: true,
          count: rentals.length,
          data: rentals
        });
      } catch (e) {
        // Fallback
      }
    }

    let rentals = fallbackStore.getAllRentals();
    if (status) rentals = rentals.filter((r) => r.status === status);
    if (carId) rentals = rentals.filter((r) => (r.car?._id || r.car).toString() === carId.toString());

    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single rental by ID
// @route   GET /api/rentals/:id
// @access  Private
export const getRentalById = async (req, res, next) => {
  try {
    const userId = (req.user.id || req.user._id).toString();

    if (isDbConnected()) {
      try {
        const rental = await Rental.findById(req.params.id)
          .populate('customer', 'name email phone drivingLicenseNumber')
          .populate('car');

        if (rental) {
          if (req.user.role === 'customer' && rental.customer._id.toString() !== userId) {
            return res.status(403).json({
              success: false,
              message: 'Not authorized to view this booking'
            });
          }
          return res.status(200).json({
            success: true,
            data: rental
          });
        }
      } catch (e) {
        // Fallback
      }
    }

    const rental = fallbackStore.getRentalById(req.params.id);
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: rental
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update rental status (Admin / Agent or cancel by Customer)
// @route   PATCH /api/rentals/:id/status
// @access  Private
export const updateRentalStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const userId = (req.user.id || req.user._id).toString();

    if (isDbConnected()) {
      try {
        const rental = await Rental.findById(req.params.id);
        if (rental) {
          if (req.user.role === 'customer') {
            if (rental.customer.toString() !== userId) {
              return res.status(403).json({
                success: false,
                message: 'Not authorized to modify this booking'
              });
            }
            if (status !== 'cancelled') {
              return res.status(400).json({
                success: false,
                message: 'Customers can only cancel a pending or confirmed booking'
              });
            }
          }

          rental.status = status;
          await rental.save();

          const updatedRental = await Rental.findById(rental._id)
            .populate('customer', 'name email phone')
            .populate('car');

          return res.status(200).json({
            success: true,
            message: `Rental status updated to ${status}`,
            data: updatedRental
          });
        }
      } catch (e) {
        // Fallback
      }
    }

    const rental = fallbackStore.updateRentalStatus(req.params.id, status);
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Rental status updated to ${status}`,
      data: rental
    });
  } catch (error) {
    next(error);
  }
};
