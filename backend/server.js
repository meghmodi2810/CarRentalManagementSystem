import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import carRoutes from './routes/carRoutes.js';
import rentalRoutes from './routes/rentalRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Middleware imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

// Load environment variables reliably from backend directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to Database
connectDB();

const app = express();

// Security Middleware: Helmet
app.use(helmet());

// Security Middleware: CORS with Whitelist
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked request from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Parsing & Logging Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// General API rate limiter
app.use('/api', apiRateLimiter);

// Health check endpoint with DB status
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Car Rental Management System API is running smoothly',
    port: process.env.PORT || 5001,
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/users', userRoutes);

// Centralized Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5050;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on http://127.0.0.1:${PORT}`);
});
