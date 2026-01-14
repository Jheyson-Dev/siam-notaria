import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // Verificar existencia del usuario en localStorage
    // En una app real, verificar expiración del token
    const user = localStorage.getItem('user');

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
