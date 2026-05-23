import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';

// Import Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SelectLocation from './pages/SelectLocation';
import CustomerDashboard from './pages/CustomerDashboard';
import CheckoutPage from './pages/CheckoutPage';
import OrderTracking from './pages/OrderTracking';
import UserOrders from './pages/UserOrders';
import StoreAdminDashboard from './pages/StoreAdminDashboard';
import CourierDashboard from './pages/CourierDashboard';
import SystemAdminDashboard from './pages/SystemAdminDashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-slate-500 font-semibold bg-[#020617]">
        Loading Session context...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#020617]">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routing */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Customer Protected Routing */}
            <Route 
              path="/select-location" 
              element={
                <ProtectedRoute allowedRoles={['Customer']}>
                  <SelectLocation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['Customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute allowedRoles={['Customer']}>
                  <CheckoutPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute allowedRoles={['Customer']}>
                  <UserOrders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders/tracking" 
              element={
                <ProtectedRoute allowedRoles={['Customer']}>
                  <OrderTracking />
                </ProtectedRoute>
              } 
            />

            {/* Store Admin Routing */}
            <Route 
              path="/store-admin" 
              element={
                <ProtectedRoute allowedRoles={['StoreAdmin']}>
                  <StoreAdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Courier Routing */}
            <Route 
              path="/courier-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['Courier']}>
                  <CourierDashboard />
                </ProtectedRoute>
              } 
            />

            {/* System Admin Routing */}
            <Route 
              path="/system-admin" 
              element={
                <ProtectedRoute allowedRoles={['SystemAdmin']}>
                  <SystemAdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
