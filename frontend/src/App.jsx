import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import AuthLandingPage from './pages/AuthLandingPage';
import HomePage from './pages/HomePage';
import CarDetailPage from './pages/CarDetailPage';
import AddVehiclePage from './pages/AddVehiclePage';
import MyRentalsPage from './pages/MyRentalsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* PUBLIC BROWSING: Guests can browse the fleet and view cars without login */}
              <Route path="/" element={<HomePage />} />
              <Route path="/fleet" element={<HomePage />} />
              <Route path="/cars/:id" element={<CarDetailPage />} />

              {/* AUTH GATEWAY */}
              <Route path="/login" element={<AuthLandingPage />} />
              <Route path="/register" element={<AuthLandingPage />} />

              {/* PROTECTED ACTIONS: Only authenticated users can list cars, book, or view reservations */}
              <Route
                path="/add-car"
                element={
                  <ProtectedRoute>
                    <AddVehiclePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-rentals"
                element={
                  <ProtectedRoute>
                    <MyRentalsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'agent']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
