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
import MyRentalsPage from './pages/MyRentalsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* FIRST PAGE: Login & Signup Landing Page */}
              <Route path="/" element={<AuthLandingPage />} />
              <Route path="/login" element={<AuthLandingPage />} />
              <Route path="/register" element={<AuthLandingPage />} />

              {/* Fleet Browsing Page */}
              <Route path="/fleet" element={<HomePage />} />
              <Route path="/cars/:id" element={<CarDetailPage />} />

              {/* Protected Customer Routes */}
              <Route
                path="/my-rentals"
                element={
                  <ProtectedRoute>
                    <MyRentalsPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
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
