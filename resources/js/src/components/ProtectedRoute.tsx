import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, isTokenExpired } from '../utils/auth';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const expired = await isTokenExpired();
            const authenticated = isAuthenticated();

            if (!expired && authenticated) {
                setAllowed(true);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    if (loading) {
        // You can show a loading spinner here if you like
        return <div>Checking auth...</div>;
    }

    if (!allowed) {
        return <Navigate to="/auth/cover-login" replace />;
    }

    return children;
}
