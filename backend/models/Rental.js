import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rental must belong to a customer'],
      index: true
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: [true, 'Rental must have an assigned car'],
      index: true
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide rental start date'],
      index: true
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide rental end date']
    },
    totalDays: {
      type: Number,
      required: true,
      min: [1, 'Rental duration must be at least 1 day']
    },
    dailyRate: {
      type: Number,
      required: true,
      min: [0, 'Daily rate cannot be negative']
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'confirmed', 'active', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid rental status'
      },
      default: 'pending',
      index: true
    },
    pickupLocation: {
      type: String,
      required: [true, 'Please provide pickup location'],
      trim: true
    },
    dropoffLocation: {
      type: String,
      required: [true, 'Please provide dropoff location'],
      trim: true
    },
    tripDestination: {
      type: String,
      default: '',
      trim: true
    },
    customerPhone: {
      type: String,
      default: '',
      trim: true
    },
    customerLicense: {
      type: String,
      default: '',
      trim: true
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['unpaid', 'paid', 'refunded'],
        message: '{VALUE} is not a valid payment status'
      },
      default: 'unpaid'
    },
    paymentDetails: {
      transactionId: { type: String, default: '' },
      method: { type: String, default: 'UPI' },
      paidAt: { type: Date, default: null }
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for frequent queries
rentalSchema.index({ customer: 1, status: 1 });
rentalSchema.index({ car: 1, startDate: 1, endDate: 1 });

const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;

