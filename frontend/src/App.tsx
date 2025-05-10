// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navigation from './components/common/Navigation';
import RoleBasedHomePage from './components/common/RoleBasedHomePage';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard Pages
import TADashboard from './pages/ta/Dashboard';
import HomePageForTA from './pages/ta/HomePageForTA';
import AdminHomePage from './pages/admin/AdminHomePage';
import TasksPage from './pages/tasks/TasksPage';
import TaskDashboard from './pages/tasks/TaskDashboard';
import TaskDetail from './components/tasks/TaskDetail';
import TaskForm from './components/tasks/TaskForm';
import SwapEligibleTargets from './components/swap/SwapEligibleTargets';

// Admin Pages
import UserCreatePage from './pages/admin/UserCreatePage';
import CourseCreatePage from './pages/admin/CourseCreatePage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

// Import new components
import LeaveApprovalDashboard from './components/leave/LeaveApprovalDashboard';
import LeaveStatisticsDashboard from './components/leave/LeaveStatisticsDashboard';
import UserReportDashboard from './components/reports/UserReportDashboard';

// Placeholder UserProfilePage component
const UserProfilePage = () => {
  const { user } = useAuth();
  return (
    <div style={{ padding: '20px', marginTop: '70px' }}>
      <h2>User Profile</h2>
      {user ? (
        <>
          <p><strong>Full Name:</strong> {user.fullName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Bilkent ID:</strong> {user.bilkentId}</p>
        </>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

// Placeholder LeaveRequestForm component
const LeaveRequestForm = () => {
  return (
    <div style={{ padding: '20px', marginTop: '70px' }}>
      <h2>Request Leave of Absence</h2>
      <p>This is where the leave request form will go.</p>
      {/* TODO: Implement actual form */}
    </div>
  );
};

// Add this SwapDemo component
const SwapDemo = () => {
  const [showSwapModal, setShowSwapModal] = useState<boolean>(false);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);

  const handleSelect = (targetId: number) => {
    setSelectedTarget(targetId);
    setShowSwapModal(false);
    alert(`Selected target: ${targetId}`);
  };

  return (
    <div style={{padding: '20px', marginTop: '60px'}}>
      <h2>Swap Eligible Targets Demo</h2>
      <p>This is a demo of the SwapEligibleTargets component.</p>
      {selectedTarget && (
        <p>You selected target ID: {selectedTarget}</p>
      )}
      <button
        onClick={() => setShowSwapModal(true)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#0074e4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Open Swap Dialog
      </button>

      {showSwapModal && (
        <SwapEligibleTargets
          assignmentId={1}
          assignmentType="task"
          onSelectTarget={handleSelect}
          onCancel={() => setShowSwapModal(false)}
        />
      )}
    </div>
  );
};

// Placeholder for DefineExamPage
const DefineExamPage = () => (
  <div style={{ padding: '20px', marginTop: '70px' }}>
    <h2>Define New Exam</h2>
    <p>Form for defining exam details (course, date, proctors needed, etc.) will go here.</p>
  </div>
);

// Placeholder for GenerateClassroomListsPage
const GenerateClassroomListsPage = () => (
  <div style={{ padding: '20px', marginTop: '70px' }}>
    <h2>Generate Classroom Lists for Exams</h2>
    <p>Interface for generating and printing student distribution lists for exam classrooms.</p>
  </div>
);

// Placeholder for TASwapApprovalPage
const TASwapApprovalPage = () => (
  <div style={{ padding: '20px', marginTop: '70px' }}>
    <h2>My Swap Requests</h2>
    <p>List of swap requests I have initiated or need to approve/reject from other TAs.</p>
  </div>
);

// Placeholder for StaffSwapApprovalPage
const StaffSwapApprovalPage = () => (
  <div style={{ padding: '20px', marginTop: '70px' }}>
    <h2>Approve TA Swaps</h2>
    <p>List of TA-to-TA agreed swaps pending final staff approval.</p>
  </div>
);

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
                <Route path="/ta/dashboard" element={<HomePageForTA />} />
                <Route path="/ta/home" element={<HomePageForTA />} />
                <Route path="/ta" element={<Navigate to="/ta/home" replace />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
                <Route path="/staff/dashboard" element={<TADashboard />} />
                <Route path="/staff/home" element={<TADashboard />} />
                <Route path="/staff" element={<Navigate to="/staff/home" replace />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['department_chair']} />}>
                <Route path="/chair/dashboard" element={<TADashboard />} />
                <Route path="/chair/home" element={<TADashboard />} />
                <Route path="/chair" element={<Navigate to="/chair/home" replace />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['dean']} />}>
                <Route path="/dean/dashboard" element={<TADashboard />} />
                <Route path="/dean/home" element={<TADashboard />} />
                <Route path="/dean" element={<Navigate to="/dean/home" replace />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminHomePage />} />
                <Route path="/admin/home" element={<AdminHomePage />} />
                <Route path="/admin" element={<Navigate to="/admin/home" replace />} />
              </Route>
              
              {/* Generic home route - conditionally render based on role */}
              <Route element={<ProtectedRoute allowedRoles={['ta', 'staff', 'department_chair', 'admin', 'dean']} />}>
                <Route path="/home" element={<RoleBasedHomePage />} />
              </Route>

              {/* Profile Route - Accessible to all authenticated users */}
              <Route element={<ProtectedRoute allowedRoles={['ta', 'staff', 'department_chair', 'admin', 'dean']} />}>
                <Route path="/profile" element={<UserProfilePage />} />
              </Route>
              
              {/* Additional routes to match the navigation bar */}
              <Route element={<ProtectedRoute allowedRoles={['ta', 'staff', 'department_chair', 'admin', 'dean']} />}>
                <Route path="/dashboard" element={<RoleBasedHomePage />} />
              </Route>
              
              {/* Routes that match exactly what's in the navigation bar */}
              <Route element={<ProtectedRoute allowedRoles={['ta']} />}>
                <Route path="/initiate-swap" element={<SwapDemo />} />
                <Route path="/my-swap-requests" element={<TASwapApprovalPage />} />
              </Route>

              {/* Task Management Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ta', 'staff', 'department_chair', 'admin']} />}>
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/tasks/dashboard" element={<TaskDashboard />} />
                <Route path="/tasks/:id" element={<TaskDetail />} />
                <Route path="/tasks/create" element={<TaskForm mode="create" />} />
                <Route path="/tasks/:id/edit" element={<TaskForm mode="edit" />} />
              </Route>
              
              {/* Leave Management Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'department_chair', 'staff']} />}>
                <Route path="/leave/approval" element={<LeaveApprovalDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['ta', 'staff', 'department_chair', 'admin']} />}>
                <Route path="/leave/statistics" element={<LeaveStatisticsDashboard />} />
                <Route path="/leave-statistics" element={<LeaveStatisticsDashboard />} />
              </Route>

              {/* TA specific leave request route */}
              <Route element={<ProtectedRoute allowedRoles={['ta']} />}>
                <Route path="/leave/request" element={<LeaveRequestForm />} />
                <Route path="/request-leave" element={<LeaveRequestForm />} />
              </Route>

              {/* Swap Management Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ta']} />}>
                <Route path="/swaps/demo" element={<SwapDemo />} />
                <Route path="/swaps/requests" element={<TASwapApprovalPage />} />
                <Route path="/initiate-swap" element={<SwapDemo />} />
                <Route path="/my-swap-requests" element={<TASwapApprovalPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['staff', 'department_chair', 'admin']} />}>
                <Route path="/swaps/approve" element={<StaffSwapApprovalPage />} />
              </Route>

              {/* Reports Routes - Adding 'dean' */}
              <Route element={<ProtectedRoute allowedRoles={['staff', 'department_chair', 'admin', 'dean']} />}>
                <Route path="/reports/users" element={<UserReportDashboard />} />
              </Route>

              {/* Admin Management Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/users/create" element={<UserCreatePage />} />
                <Route path="/admin/courses/create" element={<CourseCreatePage />} />
                <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
              </Route>

              {/* Exam Management Routes */}
              <Route element={<ProtectedRoute allowedRoles={['staff', 'department_chair', 'admin']} />}>
                <Route path="/exams/define" element={<DefineExamPage />} />
                <Route path="/exams/classroom-lists" element={<GenerateClassroomListsPage />} />
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
