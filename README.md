# Car Rental Management System (DriveFlow)

**Course:** IT7050 – Full Stack Web Development  
**Academic Level:** Individual Practical Definition (M.Sc.(IT) Sem 1)

---

## 📋 Project Overview & Requirement Compliance

This application is a complete, production-grade **Car Rental Management System** built strictly in accordance with the IT7050 course specifications.

| Requirement | Implementation Detail | Location |
| :--- | :--- | :--- |
| **1. Tech Stack** | **Frontend:** React.js (Vite)<br>**Backend:** Node.js with Express.js<br>**Database:** MongoDB with Mongoose | `frontend/`<br>`backend/` |
| **2. Layered Structure** | Layered backend architecture: `routes`, `controllers`, `models`, `middleware`, `config`, with all config in `.env` | `backend/config/`<br>`backend/controllers/`<br>`backend/models/`<br>`backend/middleware/`<br>`backend/routes/`<br>`backend/.env` |
| **3. Authentication** | JWT with **Access Token** (15m expiry) and **Refresh Token** (7d expiry, rotation), `bcryptjs` password hashing, and role-based authorization middleware (`customer`, `admin`, `agent`) | `backend/utils/generateTokens.js`<br>`backend/middleware/authMiddleware.js`<br>`backend/middleware/roleMiddleware.js`<br>`frontend/src/context/AuthContext.jsx`<br>`frontend/src/api/axios.js` |
| **4. Security** | • `helmet` for secure HTTP headers<br>• CORS whitelist validation<br>• Rate limiting (`express-rate-limit`) on `/api/auth/*` routes<br>• Input validation with `express-validator`<br>• Centralized error handling (`errorHandler`, `notFound`) | `backend/server.js`<br>`backend/middleware/rateLimiter.js`<br>`backend/middleware/validatorMiddleware.js`<br>`backend/middleware/errorMiddleware.js`<br>`backend/routes/authRoutes.js` |
| **5. Frontend** | • React Router v7 with role-aware `<ProtectedRoute>`<br>• Controlled forms with instant validation<br>• `useState` and `useEffect` hooks across pages<br>• Standardized **Loading**, **Error**, and **Empty** states on every view | `frontend/src/components/ProtectedRoute.jsx`<br>`frontend/src/components/LoadingSpinner.jsx`<br>`frontend/src/components/ErrorMessage.jsx`<br>`frontend/src/components/EmptyState.jsx`<br>`frontend/src/pages/` |
| **6. Database** | Mongoose schemas with field validations, compound indexes, text indexes, and `.populate('customer').populate('car')` for referencing documents | `backend/models/User.js`<br>`backend/models/Car.js`<br>`backend/models/Rental.js`<br>`backend/controllers/rentalController.js` |

---

## 📂 Project Directory Structure

```text
CarRentalManagementSystem/
├── package.json                    # Root scripts for running client & server
├── .gitignore                      # Git ignore file
├── README.md                       # Complete documentation
│
├── backend/                        # Node.js + Express.js API
│   ├── config/
│   │   ├── db.js                   # Mongoose connection
│   │   └── seed.js                 # Database seeder (Cars, Users, Bookings)
│   ├── controllers/
│   │   ├── authController.js       # Register, Login, Refresh Token, Logout
│   │   ├── carController.js        # CRUD, Filter, Search for Fleet
│   │   ├── rentalController.js     # Bookings, status updates, populate
│   │   └── userController.js       # User management
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT Access Token verification
│   │   ├── roleMiddleware.js       # Role authorization (Admin/Agent/Customer)
│   │   ├── rateLimiter.js          # express-rate-limit for auth endpoints
│   │   ├── validatorMiddleware.js  # express-validator result handler
│   │   └── errorMiddleware.js      # Centralized error handler & 404
│   ├── models/
│   │   ├── User.js                 # Schema with bcrypt hook & indexes
│   │   ├── Car.js                  # Schema with validation & compound index
│   │   └── Rental.js               # Schema referencing User & Car
│   ├── routes/
│   │   ├── authRoutes.js           # Auth routes with validation & rate limit
│   │   ├── carRoutes.js            # Fleet routes with RBAC
│   │   ├── rentalRoutes.js         # Booking routes with RBAC
│   │   └── userRoutes.js           # User administration routes
│   ├── utils/
│   │   └── generateTokens.js       # JWT access & refresh token generator
│   ├── .env                        # Environment configurations
│   ├── .env.example                # Example template
│   ├── package.json
│   └── server.js                   # Express app entry with Helmet & CORS
│
└── frontend/                       # React.js (Vite) Single Page App
    ├── src/
    │   ├── api/
    │   │   └── axios.js            # Axios with auto JWT token refresh
    │   ├── context/
    │   │   └── AuthContext.jsx     # Authentication context provider
    │   ├── components/
    │   │   ├── Navbar.jsx          # Responsive navigation & role badge
    │   │   ├── Footer.jsx          # Academic credit & course footer
    │   │   ├── ProtectedRoute.jsx  # Auth & Role-based route guard
    │   │   ├── CarCard.jsx         # Vehicle card with specs & pricing
    │   │   ├── LoadingSpinner.jsx  # Loading state component
    │   │   ├── ErrorMessage.jsx    # Error state component with retry
    │   │   └── EmptyState.jsx      # Empty state component with action
    │   ├── pages/
    │   │   ├── HomePage.jsx        # Fleet browsing, search, filter, states
    │   │   ├── CarDetailPage.jsx   # Vehicle specs & controlled booking form
    │   │   ├── LoginPage.jsx       # Controlled login + demo account pills
    │   │   ├── RegisterPage.jsx    # Controlled registration with validation
    │   │   ├── MyRentalsPage.jsx   # Customer reservations list & cancel
    │   │   ├── AdminDashboardPage.jsx # Fleet, Bookings & Users management
    │   │   └── NotFoundPage.jsx    # 404 Page
    │   ├── App.jsx                 # React Router setup
    │   ├── index.css               # Clean modern UI styling
    │   └── main.jsx
    ├── package.json
    └── vite.config.js              # Vite server & API proxy
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18 or higher (tested on Node v26)
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI.

### 2. Install Dependencies
Dependencies are installed locally inside the project without any global installations:
```bash
# In backend
cd backend
npm install

# In frontend
cd ../frontend
npm install
```

### 3. Configure Environment Variables
The backend configuration is already prepared in `backend/.env`. You can modify it if needed:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/car_rental_db

JWT_ACCESS_SECRET=car_rental_jwt_access_secret_super_secure_key_123456
JWT_REFRESH_SECRET=car_rental_jwt_refresh_secret_super_secure_key_654321
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### 4. Seed Sample Database (Cars, Users, Bookings)
Populate the database with ready-to-test cars, users, and rentals:
```bash
npm run seed
# or
node backend/config/seed.js
```

### 5. Running the Application

#### Start Backend Server:
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

#### Start Frontend Client (in a separate terminal):
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:5173
```

---

## 🔑 Default Demo Accounts

For fast evaluation and demonstration, the seeder creates the following accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@carrental.com` | `adminpassword123` | Full access: Add/Edit/Delete Cars, Manage all bookings, View users |
| **Customer** | `alex@example.com` | `password123` | Browse cars, Book vehicles, View & Cancel personal rentals |

*(Tip: On the Login page, you can click the **Admin Account** or **Customer Account** buttons to instantly fill the credentials!)*

