import Rental from '../models/Rental.js';
import Car from '../models/Car.js';

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

    const car = await Car.findById(carId);
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

    // Check for conflicting active/confirmed rentals
    const existingConflict = await Rental.findOne({
      car: carId,
      status: { $in: ['confirmed', 'active'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (existingConflict) {
      return res.status(400).json({
        success: false,
        message: 'This car is already booked for the selected date range'
      });
    }

    // Calculate days and total amount
    const diffTime = Math.abs(end - start);
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalAmount = totalDays * car.dailyRate;

    const rental = await Rental.create({
      customer: req.user.id,
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

    // Populate car and customer details
    const populatedRental = await Rental.findById(rental._id)
      .populate('car')
      .populate('customer', 'name email phone drivingLicenseNumber');

    res.status(201).json({
      success: true,
      message: 'Rental booking created successfully',
      data: populatedRental
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
    const rentals = await Rental.find({ customer: req.user.id })
      .populate('car')
      .sort({ createdAt: -1 });

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
    const filter = {};

    if (status) filter.status = status;
    if (carId) filter.car = carId;

    const rentals = await Rental.find(filter)
      .populate('customer', 'name email phone drivingLicenseNumber')
      .populate('car')
      .sort({ createdAt: -1 });

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
    const rental = await Rental.findById(req.params.id)
      .populate('customer', 'name email phone drivingLicenseNumber')
      .populate('car');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental booking not found'
      });
    }

    // Ensure customers can only view their own rentals
    if (req.user.role === 'customer' && rental.customer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
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
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental booking not found'
      });
    }

    // If customer is cancelling
    if (req.user.role === 'customer') {
      if (rental.customer.toString() !== req.user.id) {
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

    res.status(200).json({
      success: true,
      message: `Rental status updated to ${status}`,
      data: updatedRental
    });
  } catch (error) {
    next(error);
  }
};

