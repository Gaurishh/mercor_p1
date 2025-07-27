import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthPage from './pages/Auth/AuthPage';
import VerifyEmailPage from './pages/Auth/VerifyEmailPage';
import ClientReadyPage from './pages/Client/ClientReadyPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import Activate from './pages/Activate';

function RequireAuth({ children }) {
  const location = useLocation();
  const employeeId = localStorage.getItem('employeeId');
  if (!employeeId) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  return children;
}

function RequireAdmin({ children }) {
  const location = useLocation();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const employeeId = localStorage.getItem('employeeId');
  if (!employeeId) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/client-ready" replace />;
  }
  return children;
}

function RequireClient({ children }) {
  const location = useLocation();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const employeeId = localStorage.getItem('employeeId');
  if (!employeeId) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/activate" element={<Activate />} />
        <Route path="/admin/dashboard" element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        } />
        <Route path="/client-ready" element={
          <RequireClient>
            <ClientReadyPage />
          </RequireClient>
        } />
        <Route path="/" element={<Navigate to="/signin" replace />} />
        {/* Catch-all: redirect unknown routes to /signin */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 