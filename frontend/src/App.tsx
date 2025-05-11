import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Theme configuration
import theme from './config/theme';

// Context providers
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Role-specific dashboard pages
import TADashboardPage from './pages/ta/TADashboardPage';
import StaffDashboardPage from './pages/staff/StaffDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

// Common components
import ProtectedRoute from './components/common/ProtectedRoute';

// Role types
import { UserRole } from './types/auth';

// Not Found page
const NotFoundPage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
  </div>
);

// App Routes component - uses auth context
const AppRoutes = () => {
  const { authState } = useAuth();
  const { isAuthenticated, user } = authState;

  // Helper function to redirect based on user role
  const getDashboardPath = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'staff':
        return '/staff/dashboard';
      case 'ta':
        return '/ta/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={getDashboardPath(user?.role)} /> : <LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      
      {/* Redirect root to appropriate dashboard or login */}
      <Route path="/" element={isAuthenticated ? <Navigate to={getDashboardPath(user?.role)} /> : <Navigate to="/login" />} />
      
      {/* Protected routes with MainLayout */}
      {/* TA Routes */}
      <Route
        path="/ta"
        element={
          <ProtectedRoute allowedRoles={['ta']} />
        }
      >
        <Route element={<MainLayout />}>
          <Route path="dashboard" element={<TADashboardPage />} />
          {/* Add more TA routes here */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
      
      {/* Staff Routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['staff']} />
        }
      >
        <Route element={<MainLayout />}>
          <Route path="dashboard" element={<StaffDashboardPage />} />
          {/* Add more Staff routes here */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
      
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']} />
        }
      >
        <Route element={<MainLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          {/* Add more Admin routes here */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
