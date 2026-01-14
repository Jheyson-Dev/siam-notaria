import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginLayout from './components/Login/LoginLayout'
import LoginForm from './components/Login/LoginForm'
import ResetPasswordForm from './components/Login/ResetPasswordForm';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './components/Dashboard/Dashboard';
import ChangePassword from './components/Profile/ChangePassword';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import UserManagement from './components/Admin/UserManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <LoginLayout>
            <LoginForm />
          </LoginLayout>
        } />
        <Route path="/reset-password/:token" element={
          <LoginLayout>
            <ResetPasswordForm />
          </LoginLayout>
        } />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/admin/users" element={<UserManagement />} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
