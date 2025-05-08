// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navigation from './components/common/Navigation';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard Pages
import TADashboard from './pages/ta/Dashboard';
import TasksPage from './pages/tasks/TasksPage';
import TaskDashboard from './pages/tasks/TaskDashboard';
import TaskDetail from './components/tasks/TaskDetail';
import TaskForm from './components/tasks/TaskForm';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navigation />
          <div className="content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              
              {/* Dashboard Routes for different roles */}
              <Route element={<ProtectedRoute allowedRoles={['ta']} />}>
                <Route path="/ta/dashboard" element={<TADashboard />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
                <Route path="/staff/dashboard" element={<TADashboard />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['department_chair']} />}>
                <Route path="/chair/dashboard" element={<TADashboard />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<TADashboard />} />
              </Route>

              {/* Task Management Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ta', 'staff', 'department_chair', 'admin']} />}>
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/tasks/dashboard" element={<TaskDashboard />} />
                <Route path="/tasks/:id" element={<TaskDetail />} />
              </Route>
              
              {/* Staff/Admin only routes */}
              <Route element={<ProtectedRoute allowedRoles={['staff', 'department_chair', 'admin']} />}>
                <Route path="/tasks/create" element={<TaskForm mode="create" />} />
                <Route path="/tasks/:id/edit" element={<TaskForm mode="edit" />} />
              </Route>
              
              {/* Catch all route - redirect to login */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
