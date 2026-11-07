import Car from '../models/Car.js';
import Rental from '../models/Rental.js';

// @desc    Get all cars with filters, search, and date-range availability
// @route   GET /api/cars
// @access  Public
export const getCars = async (req, res, next) => {
  try {
    const {
      category,
      status,
      minPrice,
      maxPrice,
      search,
      sort,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (minPrice || maxPrice) {
      query.dailyRate = {};
      if (minPrice) query.dailyRate.$gte = Number(minPrice);
      if (maxPrice) query.dailyRate.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Exclude cars that are already booked for the requested date window
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
        const conflictingRentals = await Rental.find({
          status: { $in: ['confirmed', 'active'] },
          $or: [
            { startDate: { $lte: end }, endDate: { $gte: start } }
          ]
        }).select('car');

        const bookedCarIds = conflictingRentals.map((r) => r.car);
        if (bookedCarIds.length > 0) {
          query._id = { $nin: bookedCarIds };
        }
      }
    }

    let queryBuilder = Car.find(query);

    // Sorting
    if (sort === 'price_asc') {
      queryBuilder = queryBuilder.sort({ dailyRate: 1 });
    } else if (sort === 'price_desc') {
      queryBuilder = queryBuilder.sort({ dailyRate: -1 });
    } else if (sort === 'year_desc') {
      queryBuilder = queryBuilder.sort({ year: -1 });
    } else {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    }

    const cars = await queryBuilder;

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single car by ID
// @route   GET /api/cars/:id
// @access  Public
export const getCarById = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.status(200).json({
      success: true,
      data: car
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new car
// @route   POST /api/cars
// @access  Private (Admin / Agent)
export const createCar = async (req, res, next) => {
  try {
    const car = await Car.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      data: car
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update car details
// @route   PUT /api/cars/:id
// @access  Private (Admin / Agent)
export const updateCar = async (req, res, next) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Car updated successfully',
      data: car
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private (Admin)
export const deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Car deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
