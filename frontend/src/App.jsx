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
              {/* FIRST PAGE: Login & Signup Gateway (Public) */}
              <Route path="/" element={<AuthLandingPage />} />
              <Route path="/login" element={<AuthLandingPage />} />
              <Route path="/register" element={<AuthLandingPage />} />

              {/* ALL PORTAL FEATURES ARE STRICTLY PROTECTED BEHIND LOGIN */}
              <Route
                path="/fleet"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cars/:id"
                element={
                  <ProtectedRoute>
                    <CarDetailPage />
                  </ProtectedRoute>
                }
              />
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
