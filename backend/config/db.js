import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedInitialData } from './seed.js';
import User from '../models/User.js';
import { fallbackStore } from './fallbackStore.js';

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

// Sync local users to MongoDB Atlas
export const syncLocalUsersToDb = async () => {
  if (!isDbConnected()) return;
  try {
    const localUsers = fallbackStore.getAllUsers();
    for (const u of localUsers) {
      const existing = await User.findOne({ email: u.email.toLowerCase() });
      if (!existing) {
        await User.create({
          _id: u._id,
          name: u.name,
          email: u.email.toLowerCase(),
          password: u.password,
          role: u.role || 'customer',
          phone: u.phone || '',
          drivingLicenseNumber: u.drivingLicenseNumber || '',
          isActive: true
        });
        console.log(`[Sync] Synced user ${u.email} to MongoDB Atlas`);
      }
    }
  } catch (err) {
    console.error('[Sync] Error syncing users to Atlas:', err.message);
  }
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

    // Sync any registered local users into MongoDB Atlas
    await syncLocalUsersToDb();
  } catch (error) {
    isConnected = false;
    console.log(`[Database] MongoDB Atlas connection pending: ${error.message}`);
    console.log('[Database] If IP access is restricted, add 0.0.0.0/0 to your Atlas Network Access list.');
    console.log('[Database] Running persistent high-availability store in the meantime.');

    // Schedule background retry
    setTimeout(() => {
      if (mongoose.connection.readyState !== 1) {
        connectDB();
      }
    }, 15000);
  }
};

export default connectDB;
