import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    make: {
      type: String,
      required: [true, 'Please provide the car make / brand'],
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Please provide the car model'],
      trim: true
    },
    year: {
      type: Number,
      required: [true, 'Please provide the model year'],
      min: [1990, 'Year must be 1990 or later'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
    },
    licensePlate: {
      type: String,
      required: [true, 'Please provide a license plate number'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Please specify car category'],
      enum: {
        values: ['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Electric', 'Van'],
        message: '{VALUE} is not a valid car category'
      },
      index: true
    },
    transmission: {
      type: String,
      enum: ['Automatic', 'Manual'],
      default: 'Automatic'
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
      default: 'Petrol'
    },
    seatingCapacity: {
      type: Number,
      required: [true, 'Please specify seating capacity'],
      min: [1, 'Must have at least 1 seat'],
      max: [15, 'Maximum seating capacity is 15']
    },
    dailyRate: {
      type: Number,
      required: [true, 'Please provide the daily rental rate'],
      min: [0, 'Daily rate cannot be negative'],
      index: true
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'rented', 'maintenance'],
        message: '{VALUE} is not a valid status'
      },
      default: 'available',
      index: true
    },
    mileage: {
      type: Number,
      default: 0,
      min: [0, 'Mileage cannot be negative']
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
    },
    features: {
      type: [String],
      default: []
    },
    location: {
      type: String,
      required: [true, 'Please provide the car branch / location'],
      trim: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient searching & filtering
carSchema.index({ status: 1, category: 1, dailyRate: 1 });
carSchema.index({ make: 'text', model: 'text', location: 'text' });

const Car = mongoose.model('Car', carSchema);
export default Car;

