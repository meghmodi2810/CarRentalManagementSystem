import Car from '../models/Car.js';
import Rental from '../models/Rental.js';
import { isDbConnected } from '../config/db.js';
import { fallbackStore } from '../config/fallbackStore.js';

// @desc    Get all cars with filters, search, and date-range availability
// @route   GET /api/cars
// @access  Public (or Protected)
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

    if (isDbConnected()) {
      try {
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

        let queryBuilder = Car.find(query).populate('owner', 'name email phone');

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

        return res.status(200).json({
          success: true,
          count: cars.length,
          data: cars
        });
      } catch (dbErr) {
        // Fallback if DB query fails
      }
    }

    // Dynamic Store query
    const cars = fallbackStore.getCars({
      category,
      status,
      minPrice,
      maxPrice,
      search,
      sort
    });

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
// @access  Public (or Protected)
export const getCarById = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const car = await Car.findById(req.params.id).populate('owner', 'name email phone');
        if (car) {
          return res.status(200).json({
            success: true,
            data: car
          });
        }
      } catch (e) {
        // Continue to fallback
      }
    }

    const car = fallbackStore.getCarById(req.params.id);
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

// @desc    Create a new car (List vehicle to give on rent)
// @route   POST /api/cars
// @access  Private (Authenticated users / Hosts / Admins)
export const createCar = async (req, res, next) => {
  try {
    const carData = {
      ...req.body,
      owner: req.user?.id || req.user?._id || null,
      ownerName: req.user?.name || 'DriveFlow Host'
    };

    if (isDbConnected()) {
      try {
        const car = await Car.create(carData);
        return res.status(201).json({
          success: true,
          message: 'Vehicle listed successfully',
          data: car
        });
      } catch (dbErr) {
        // Fallback
      }
    }

    const car = fallbackStore.createCar(carData);
    res.status(201).json({
      success: true,
      message: 'Vehicle listed successfully',
      data: car
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update car details
// @route   PUT /api/cars/:id
// @access  Private
export const updateCar = async (req, res, next) => {
  try {
    const userId = (req.user?.id || req.user?._id || '').toString();
    const isAdmin = req.user?.role === 'admin';

    if (isDbConnected()) {
      try {
        const existingCar = await Car.findById(req.params.id);
        if (!existingCar) {
          return res.status(404).json({ success: false, message: 'Car not found' });
        }
        const ownerId = (existingCar.owner?._id || existingCar.owner)?.toString();
        if (!isAdmin && ownerId && ownerId !== userId) {
          return res.status(403).json({ success: false, message: 'Not authorized to update this vehicle listing' });
        }

        const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
        });

        if (car) {
          return res.status(200).json({
            success: true,
            message: 'Vehicle updated successfully',
            data: car
          });
        }
      } catch (e) {
        // Continue
      }
    }

    const car = fallbackStore.updateCar(req.params.id, req.body);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: car
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete car (Owner or Admin)
// @route   DELETE /api/cars/:id
// @access  Private
export const deleteCar = async (req, res, next) => {
  try {
    const userId = (req.user?.id || req.user?._id || '').toString();
    const isAdmin = req.user?.role === 'admin';

    if (isDbConnected()) {
      try {
        const car = await Car.findById(req.params.id);
        if (!car) {
          return res.status(404).json({ success: false, message: 'Car not found' });
        }

        const ownerId = (car.owner?._id || car.owner)?.toString();
        if (!isAdmin && ownerId && ownerId !== userId) {
          return res.status(403).json({
            success: false,
            message: 'You are not authorized to delete this vehicle listing.'
          });
        }

        await Car.findByIdAndDelete(req.params.id);
        // Also cancel any pending rentals for this car
        await Rental.updateMany(
          { car: req.params.id, status: 'pending' },
          { status: 'cancelled' }
        );

        return res.status(200).json({
          success: true,
          message: 'Vehicle listing removed successfully'
        });
      } catch (e) {
        // Continue
      }
    }

    const existingCar = fallbackStore.getCarById(req.params.id);
    if (!existingCar) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    const ownerId = (existingCar.owner?._id || existingCar.owner)?.toString();
    if (!isAdmin && ownerId && ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this vehicle listing.'
      });
    }

    const success = fallbackStore.deleteCar(req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle listing removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like / save car for later
// @route   POST /api/cars/:id/like
// @access  Private
export const toggleLikeCar = async (req, res, next) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const carId = req.params.id;

    if (isDbConnected()) {
      try {
        const car = await Car.findById(carId);
        if (!car) {
          return res.status(404).json({ success: false, message: 'Car not found' });
        }

        if (!car.likes) car.likes = [];
        const index = car.likes.findIndex((id) => id.toString() === userId);
        let isLiked = false;

        if (index === -1) {
          car.likes.push(userId);
          isLiked = true;
        } else {
          car.likes.splice(index, 1);
          isLiked = false;
        }

        car.likesCount = car.likes.length;
        await car.save();

        return res.status(200).json({
          success: true,
          isLiked,
          likesCount: car.likesCount,
          message: isLiked ? 'Vehicle saved to your favorites' : 'Vehicle removed from favorites'
        });
      } catch (err) {
        // Fallback
      }
    }

    const result = fallbackStore.toggleLikeCar(carId, userId);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    res.status(200).json({
      success: true,
      isLiked: result.isLiked,
      likesCount: result.likesCount,
      message: result.isLiked ? 'Vehicle saved to your favorites' : 'Vehicle removed from favorites'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved / liked cars for logged-in user
// @route   GET /api/cars/saved
// @access  Private
export const getSavedCars = async (req, res, next) => {
  try {
    const userId = (req.user.id || req.user._id).toString();

    if (isDbConnected()) {
      try {
        const cars = await Car.find({ likes: userId }).populate('owner', 'name email phone');
        return res.status(200).json({
          success: true,
          count: cars.length,
          data: cars
        });
      } catch (err) {
        // Fallback
      }
    }

    const cars = fallbackStore.getSavedCars(userId);
    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars
    });
  } catch (error) {
    next(error);
  }
};
