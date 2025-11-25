import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSkeleton from './components/LoadingSkeleton';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const TestPage = lazy(() => import('./pages/TestPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <ToastProvider>
                    <Router>
                        <AuthProvider>
                            <Suspense fallback={<LoadingSkeleton />}>
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route
                                        path="/dashboard"
                                        element={
                                            <ProtectedRoute>
                                                <DashboardPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin"
                                        element={
                                            <ProtectedRoute>
                                                <AdminPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/test/:sessionId"
                                        element={
                                            <ProtectedRoute>
                                                <TestPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/results/:sessionId"
                                        element={
                                            <ProtectedRoute>
                                                <ResultsPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                </Routes>
                            </Suspense>
                        </AuthProvider>
                    </Router>
                </ToastProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
