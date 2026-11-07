import mongoose from 'mongoose';
import { seedInitialData } from './seed.js';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/car_rental_db';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    
    // Auto-seed initial fleet and demo accounts if empty
    await seedInitialData();
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.log('📌 NOTE: If local MongoDB is not running, ensure mongod service is active or update MONGO_URI in backend/.env with your MongoDB Atlas connection string.');
  }
};

export default connectDB;
