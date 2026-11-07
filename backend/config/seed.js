import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Car from '../models/Car.js';
import Rental from '../models/Rental.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/car_rental_db');
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await Rental.deleteMany();
    await Car.deleteMany();
    await User.deleteMany();
    console.log('Cleared existing collections...');

    // 1. Create Users
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@carrental.com',
      password: 'adminpassword123',
      role: 'admin',
      phone: '+1 555-0100',
      drivingLicenseNumber: 'DL-ADMIN-9999'
    });

    const customerUser = await User.create({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: 'password123',
      role: 'customer',
      phone: '+1 555-0199',
      drivingLicenseNumber: 'DL-NY-847291'
    });

    console.log('Users created:');
    console.log(` - Admin: admin@carrental.com / adminpassword123`);
    console.log(` - Customer: alex@example.com / password123`);

    // 2. Create Cars
    const cars = await Car.insertMany([
      {
        make: 'Tesla',
        model: 'Model 3 Long Range',
        year: 2024,
        licensePlate: 'EV-300-TS',
        category: 'Electric',
        transmission: 'Automatic',
        fuelType: 'Electric',
        seatingCapacity: 5,
        dailyRate: 95,
        status: 'available',
        mileage: 8200,
        imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1000&q=80',
        features: ['Autopilot', 'Navigation', 'Heated Seats', 'Glass Roof', 'Bluetooth'],
        location: 'Downtown Hub'
      },
      {
        make: 'BMW',
        model: '5 Series M Sport',
        year: 2023,
        licensePlate: 'BM-520-MS',
        category: 'Luxury',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        seatingCapacity: 5,
        dailyRate: 120,
        status: 'available',
        mileage: 15400,
        imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80',
        features: ['Leather Seats', 'Sunroof', 'Harman Kardon Audio', 'Parking Assist'],
        location: 'Airport Terminal 1'
      },
      {
        make: 'Toyota',
        model: 'RAV4 Hybrid',
        year: 2023,
        licensePlate: 'TY-442-HB',
        category: 'SUV',
        transmission: 'Automatic',
        fuelType: 'Hybrid',
        seatingCapacity: 5,
        dailyRate: 75,
        status: 'available',
        mileage: 22000,
        imageUrl: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1000&q=80',
        features: ['All-Wheel Drive', 'Apple CarPlay', 'Adaptive Cruise', 'Backup Camera'],
        location: 'Downtown Hub'
      },
      {
        make: 'Mercedes-Benz',
        model: 'C-Class Sedan',
        year: 2024,
        licensePlate: 'MB-202-CC',
        category: 'Sedan',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        seatingCapacity: 5,
        dailyRate: 110,
        status: 'available',
        mileage: 9100,
        imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80',
        features: ['Digital Cockpit', 'Ambient Lighting', 'Surround Sound', 'Blind Spot Assist'],
        location: 'Uptown Branch'
      },
      {
        make: 'Volkswagen',
        model: 'Golf TSI',
        year: 2022,
        licensePlate: 'VW-118-GF',
        category: 'Hatchback',
        transmission: 'Manual',
        fuelType: 'Petrol',
        seatingCapacity: 5,
        dailyRate: 50,
        status: 'available',
        mileage: 31000,
        imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80',
        features: ['Eco Mode', 'Touchscreen Infotainment', 'Isofix', 'Cruise Control'],
        location: 'Downtown Hub'
      },
      {
        make: 'Ford',
        model: 'Transit Passenger Van',
        year: 2023,
        licensePlate: 'FD-789-VN',
        category: 'Van',
        transmission: 'Automatic',
        fuelType: 'Diesel',
        seatingCapacity: 12,
        dailyRate: 135,
        status: 'available',
        mileage: 18500,
        imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
        features: ['High Roof', 'Luggage Space', 'Rear AC', 'Reverse Camera'],
        location: 'Airport Terminal 1'
      }
    ]);

    console.log(`Created ${cars.length} sample cars.`);

    // 3. Create Sample Rental
    const today = new Date();
    const startDate = new Date(today.setDate(today.getDate() + 1));
    const endDate = new Date(today.setDate(today.getDate() + 4));
    const totalDays = 3;
    const totalAmount = totalDays * cars[0].dailyRate;

    await Rental.create({
      customer: customerUser._id,
      car: cars[0]._id,
      startDate,
      endDate,
      totalDays,
      dailyRate: cars[0].dailyRate,
      totalAmount,
      status: 'confirmed',
      pickupLocation: 'Downtown Hub',
      dropoffLocation: 'Downtown Hub',
      paymentStatus: 'paid',
      notes: 'Initial test booking for customer Alex Johnson'
    });

    console.log('Sample rental created successfully!');
    console.log('Database seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();

