import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
    const user = JSON.parse(localStorage.getItem('user'));

    // 1. Not Logged In? -> Login Page
    if (!user) return <Navigate to="/" />;

    // 2. Wrong Role? -> Home Page
    if (role && user.role !== role) return <Navigate to="/home" />;

    return children;
};

export default ProtectedRoute;