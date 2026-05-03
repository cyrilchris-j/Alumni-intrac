import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { currentUser, userRole, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '100vh', background: 'var(--bg-page)' }}>
                <div className="loader"></div> {/* We can add a simple CSS loader later */}
                <p style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    if (!currentUser) {
        // Not logged in, redirect to login
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Logged in but wrong role - redirect to their actual dashboard or home
        if (userRole === 'student') return <Navigate to="/student" replace />;
        if (userRole === 'alumni') return <Navigate to="/alumni" replace />;
        if (userRole === 'admin') return <Navigate to="/admin" replace />;

        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
