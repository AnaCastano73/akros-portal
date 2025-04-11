
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Documents from '@/pages/Documents';
import Courses from '@/pages/Courses';
import Notifications from '@/pages/Notifications';
import Chat from '@/pages/Chat';
import UserManagement from '@/pages/admin/UserManagement';
import CourseManagement from '@/pages/admin/CourseManagement';
import CompanyManagement from '@/pages/admin/CompanyManagement';
import Index from '@/pages/Index';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
  };

  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated && user?.role === 'admin' ? (
      <>{children}</>
    ) : (
      <Navigate to="/dashboard" />
    );
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <PrivateRoute>
            <Documents />
          </PrivateRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <PrivateRoute>
            <Courses />
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <AdminRoute>
            <CourseManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/companies"
        element={
          <AdminRoute>
            <CompanyManagement />
          </AdminRoute>
        }
      />
      {/* Root route points to Index component which handles redirects */}
      <Route path="/" element={<Index />} />
    </Routes>
  );
};

export default App;
