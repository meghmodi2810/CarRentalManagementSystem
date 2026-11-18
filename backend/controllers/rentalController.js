import Rental from '../models/Rental.js';
import Car from '../models/Car.js';
import { isDbConnected } from '../config/db.js';
import { fallbackStore } from '../config/fallbackStore.js';
import { sendNotification } from './notificationController.js';

// @desc    Create a new rental booking request (NO payment required yet; pending host approval)
// @route   POST /api/rentals
// @access  Private (Customer / Admin)
export const createRental = async (req, res, next) => {
  try {
    const {
      carId,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
      tripDestination,
      customerPhone,
      customerLicense,
      notes
    } = req.body;

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

    const userId = (req.user.id || req.user._id).toString();
    const carOwnerId = (car.owner?._id || car.owner)?.toString();

    // Prevent user from booking their own listed vehicle
    if (carOwnerId && carOwnerId === userId) {
      return res.status(400).json({
        success: false,
        message: 'You listed this vehicle. You cannot rent your own vehicle.'
      });
    }

    // Calculate days and total amount
    const diffTime = Math.abs(end - start);
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalAmount = totalDays * car.dailyRate;

    let createdRental = null;

    if (isDbConnected()) {
      try {
        const rental = await Rental.create({
          customer: userId,
          car: carId,
          host: carOwnerId || null,
          startDate: start,
          endDate: end,
          totalDays,
          dailyRate: car.dailyRate,
          totalAmount,
          status: 'pending', // Starts as pending until host reviews and approves (NO PAYMENT YET!)
          pickupLocation: pickupLocation || car.location,
          dropoffLocation: dropoffLocation || car.location,
          tripDestination: tripDestination ? tripDestination.trim() : '',
          customerPhone: customerPhone || req.user.phone || '',
          customerLicense: customerLicense || req.user.drivingLicenseNumber || '',
          notes: notes || '',
          paymentStatus: 'unpaid',
          paymentDetails: null
        });

        createdRental = await Rental.findById(rental._id)
          .populate('car')
          .populate('customer', 'name email phone drivingLicenseNumber')
          .populate('host', 'name email phone');
      } catch (dbErr) {
        // Fallback to store
      }
    }

    if (!createdRental) {
      createdRental = fallbackStore.createRental({
        customer: req.user,
        car: car,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        totalDays,
        dailyRate: car.dailyRate,
        totalAmount,
        pickupLocation: pickupLocation || car.location,
        dropoffLocation: dropoffLocation || car.location,
        tripDestination: tripDestination ? tripDestination.trim() : '',
        customerPhone: customerPhone || req.user.phone || '',
        customerLicense: customerLicense || req.user.drivingLicenseNumber || '',
        notes: notes || ''
      });
    }

    // Dispatch notification to vehicle owner / host
    if (carOwnerId) {
      await sendNotification({
        recipient: carOwnerId,
        title: `New Reservation Request`,
        message: `${req.user.name} requested to reserve your ${car.make} ${car.model} for ${totalDays} ${totalDays === 1 ? 'day' : 'days'} (₹${totalAmount.toLocaleString('en-IN')}). Review request now.`,
        type: 'new_request',
        link: '/my-rentals',
        relatedRental: createdRental._id,
        relatedCar: carId
      });
    }

    res.status(201).json({
      success: true,
      message: 'Reservation request submitted to host successfully. You will only pay once the host approves your request.',
      data: createdRental
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

// @desc    Get rental requests for vehicles listed by currently logged-in host
// @route   GET /api/rentals/host-requests
// @access  Private (Host / Owner)
export const getHostRentals = async (req, res, next) => {
  try {
    const userId = (req.user.id || req.user._id).toString();

    if (isDbConnected()) {
      try {
        const myCars = await Car.find({ owner: userId }).select('_id');
        const carIds = myCars.map((c) => c._id);

        const rentals = await Rental.find({
          $or: [{ host: userId }, { car: { $in: carIds } }]
        })
          .populate('car')
          .populate('customer', 'name email phone drivingLicenseNumber')
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

    const rentals = fallbackStore.getHostRentals(userId);
    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update rental status (Admin / Host accept-reject / Customer cancel)
// @route   PATCH /api/rentals/:id/status
// @access  Private
export const updateRentalStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const userId = (req.user.id || req.user._id).toString();
    const isAdmin = req.user.role === 'admin';

    if (isDbConnected()) {
      try {
        const rental = await Rental.findById(req.params.id).populate('car').populate('customer');
        if (rental) {
          const isCustomer = (rental.customer?._id || rental.customer).toString() === userId;
          const carOwnerId = (rental.car?.owner?._id || rental.car?.owner)?.toString();
          const hostId = (rental.host?._id || rental.host)?.toString();
          const isHost = hostId === userId || carOwnerId === userId;

          if (!isAdmin && !isHost && !isCustomer) {
            return res.status(403).json({
              success: false,
              message: 'Not authorized to modify this booking'
            });
          }

          if (isCustomer && !isHost && !isAdmin) {
            if (status !== 'cancelled') {
              return res.status(400).json({
                success: false,
                message: 'Customers can only cancel a pending or approved booking'
              });
            }
          }

          if (isHost && !isAdmin && !['approved', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({
              success: false,
              message: 'Vehicle hosts can approve (approved) or decline (cancelled) requests'
            });
          }

          // If host approves, status is 'approved' (awaiting customer payment)
          const finalStatus = isHost && status === 'confirmed' ? 'approved' : status;
          rental.status = finalStatus;

          if (finalStatus === 'cancelled' && rental.paymentStatus === 'paid') {
            rental.paymentStatus = 'refunded';
          }
          await rental.save();

          const updatedRental = await Rental.findById(rental._id)
            .populate('customer', 'name email phone')
            .populate('car');

          // Send notification to customer if approved
          const customerId = (rental.customer?._id || rental.customer)?.toString();
          if (finalStatus === 'approved' && customerId) {
            await sendNotification({
              recipient: customerId,
              title: `Booking Request Approved!`,
              message: `Great news! The host accepted your request for ${rental.car?.make} ${rental.car?.model}. Please complete your payment of ₹${rental.totalAmount.toLocaleString('en-IN')} to confirm the reservation.`,
              type: 'request_approved',
              link: '/my-rentals',
              relatedRental: rental._id,
              relatedCar: rental.car?._id || rental.car
            });
          } else if (finalStatus === 'cancelled' && customerId && !isCustomer) {
            await sendNotification({
              recipient: customerId,
              title: `Booking Request Declined`,
              message: `The host was unable to accept your reservation request for ${rental.car?.make} ${rental.car?.model}.`,
              type: 'request_declined',
              link: '/my-rentals',
              relatedRental: rental._id,
              relatedCar: rental.car?._id || rental.car
            });
          }

          return res.status(200).json({
            success: true,
            message: `Rental status updated to ${finalStatus}`,
            data: updatedRental
          });
        }
      } catch (e) {
        // Fallback
      }
    }

    const finalStatus = status === 'confirmed' ? 'approved' : status;
    const rental = fallbackStore.updateRentalStatus(req.params.id, finalStatus);
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental booking not found'
      });
    }

    const customerId = (rental.customer?._id || rental.customer)?.toString();
    if (finalStatus === 'approved' && customerId) {
      await sendNotification({
        recipient: customerId,
        title: `Booking Request Approved!`,
        message: `Great news! The host accepted your request for ${rental.car?.make} ${rental.car?.model}. Please complete your payment of ₹${rental.totalAmount.toLocaleString('en-IN')} to confirm the reservation.`,
        type: 'request_approved',
        link: '/my-rentals',
        relatedRental: rental._id,
        relatedCar: rental.car?._id || rental.car
      });
    }

    res.status(200).json({
      success: true,
      message: `Rental status updated to ${finalStatus}`,
      data: rental
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer pays for an approved rental booking
// @route   PATCH /api/rentals/:id/pay
// @access  Private (Customer)
export const payForRental = async (req, res, next) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const { paymentDetails } = req.body;

    if (isDbConnected()) {
      try {
        const rental = await Rental.findById(req.params.id).populate('car').populate('customer');
        if (!rental) {
          return res.status(404).json({ success: false, message: 'Rental booking not found' });
        }

        const rentalCustomerId = (rental.customer?._id || rental.customer)?.toString();
        if (rentalCustomerId !== userId && req.user.role !== 'admin') {
          return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
        }

        if (rental.status !== 'approved' && rental.status !== 'pending') {
          return res.status(400).json({
            success: false,
            message: `Payment can only be processed for approved requests (Current status: ${rental.status})`
          });
        }

        rental.paymentStatus = 'paid';
        rental.status = 'confirmed';
        rental.paymentDetails = {
          transactionId: paymentDetails?.transactionId || 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
          method: paymentDetails?.method || 'UPI',
          paidAt: new Date()
        };
        await rental.save();

        const updatedRental = await Rental.findById(rental._id).populate('car').populate('customer');

        // Notify customer
        await sendNotification({
          recipient: userId,
          title: 'Payment Successful • Booking Confirmed!',
          message: `Payment of ₹${rental.totalAmount.toLocaleString('en-IN')} received. Your reservation for ${rental.car?.make} ${rental.car?.model} is confirmed.`,
          type: 'payment_success',
          link: '/my-rentals',
          relatedRental: rental._id,
          relatedCar: rental.car?._id || rental.car
        });

        // Notify host
        const hostId = (rental.host?._id || rental.host)?.toString();
        if (hostId) {
          await sendNotification({
            recipient: hostId,
            title: `Payment Received for ${rental.car?.make} ${rental.car?.model}`,
            message: `${req.user.name} completed the payment of ₹${rental.totalAmount.toLocaleString('en-IN')}. Booking is officially confirmed!`,
            type: 'payment_success',
            link: '/my-rentals',
            relatedRental: rental._id,
            relatedCar: rental.car?._id || rental.car
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Payment processed successfully! Your vehicle booking is confirmed.',
          data: updatedRental
        });
      } catch (err) {
        // Fallback
      }
    }

    const rental = fallbackStore.payRental(req.params.id, paymentDetails);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental booking not found' });
    }

    await sendNotification({
      recipient: userId,
      title: 'Payment Successful • Booking Confirmed!',
      message: `Payment of ₹${rental.totalAmount.toLocaleString('en-IN')} received for ${rental.car?.make} ${rental.car?.model}.`,
      type: 'payment_success',
      link: '/my-rentals',
      relatedRental: rental._id,
      relatedCar: rental.car?._id || rental.car
    });

    const hostId = (rental.host || rental.car?.owner)?.toString();
    if (hostId) {
      await sendNotification({
        recipient: hostId,
        title: `Payment Received for ${rental.car?.make} ${rental.car?.model}`,
        message: `${req.user.name} completed payment of ₹${rental.totalAmount.toLocaleString('en-IN')}. Booking confirmed!`,
        type: 'payment_success',
        link: '/my-rentals',
        relatedRental: rental._id,
        relatedCar: rental.car?._id || rental.car
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully! Your vehicle booking is confirmed.',
      data: rental
    });
  } catch (error) {
    next(error);
  }
};
