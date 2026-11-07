import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedInitialData } from './seed.js';

// Ensure backend/.env is loaded reliably
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
  const mongoUri =
    process.env.MONGO_URI ||
    'mongodb+srv://meghmodi4ever_db_user:06DexyFnMfm1cd65@carrental.lto24xu.mongodb.net/car_rental_db?retryWrites=true&w=majority';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000
    });
    console.log(`✅ MongoDB Atlas Connected successfully: ${conn.connection.host}`);

    // Auto-seed initial fleet and demo accounts if database is empty
    await seedInitialData();
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.log('📌 NOTE: Check internet connectivity or MongoDB Atlas IP whitelist (Network Access) in cloud.mongodb.com.');
  }
};

export default connectDB;
