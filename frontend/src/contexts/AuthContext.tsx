import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { getErrorMessage } from '../utils/api';

interface User {
    userId: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: () => void;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Configure axios to include credentials (cookies) with requests
    axios.defaults.withCredentials = true;

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    // Set up automatic token refresh
    useEffect(() => {
        if (user) {
            // Refresh token every 14 minutes (before 15-minute expiry)
            const refreshInterval = setInterval(() => {
                refreshToken();
            }, 14 * 60 * 1000);

            return () => clearInterval(refreshInterval);
        }
    }, [user]);

    const checkAuth = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/api/auth/me');
            setUser(response.data);
        } catch (err) {
            setUser(null);
            // Don't set error for initial auth check failure
            console.error('Auth check failed:', getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const refreshToken = async () => {
        try {
            await axios.post('/api/auth/refresh');
            // Token is refreshed in httpOnly cookie
            // Optionally re-fetch user data
            const response = await axios.get('/api/auth/me');
            setUser(response.data);
        } catch (err) {
            // If refresh fails, user needs to re-authenticate
            setUser(null);
            const errorMsg = getErrorMessage(err);
            setError('Session expired. Please log in again.');
            console.error('Token refresh failed:', errorMsg);
        }
    };

    const login = () => {
        // Redirect to backend OAuth endpoint
        window.location.href = '/api/auth/google';
    };

    const logout = async () => {
        try {
            setError(null);
            await axios.post('/api/auth/logout');
            setUser(null);
        } catch (err) {
            const errorMsg = getErrorMessage(err);
            setError('Logout failed. Please try again.');
            console.error('Logout failed:', errorMsg);
            throw err;
        }
    };

    const refreshAuth = async () => {
        await checkAuth();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                login,
                logout,
                refreshAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
