import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedInitialData } from './seed.js';

// Ensure backend/.env is loaded reliably
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Disable Mongoose command buffering so failed connections do not hang requests for 10 seconds
mongoose.set('bufferCommands', false);

let isConnected = false;

export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

const connectDB = async () => {
  const mongoUri =
    process.env.MONGO_URI ||
    'mongodb+srv://meghmodi4ever_db_user:06DexyFnMfm1cd65@carrental.lto24xu.mongodb.net/car_rental_db?retryWrites=true&w=majority';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);

    // Auto-seed initial fleet and demo accounts if database is empty
    await seedInitialData();
  } catch (error) {
    isConnected = false;
    console.log(`[Database] MongoDB Atlas connection pending: ${error.message}`);
    console.log('[Database] If IP access is restricted, add 0.0.0.0/0 to your Atlas Network Access list.');
    console.log('[Database] Running dynamic high-availability fallback store in the meantime.');

    // Schedule background retry
    setTimeout(() => {
      if (mongoose.connection.readyState !== 1) {
        connectDB();
      }
    }, 15000);
  }
};

export default connectDB;
