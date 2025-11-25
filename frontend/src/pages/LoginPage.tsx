import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Paper,
    Typography,
    Alert,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
    const { user, login, error: authError } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlError = searchParams.get('error');

    // Redirect to dashboard if already authenticated
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleGoogleLogin = () => {
        login();
    };

    const getErrorMessage = (errorCode: string | null): string => {
        switch (errorCode) {
            case 'auth_failed':
                return 'Authentication failed. Please try again.';
            case 'session_expired':
                return 'Your session has expired. Please log in again.';
            default:
                return 'An error occurred during authentication. Please try again.';
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        width: '100%',
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h3" component="h1" gutterBottom>
                        GATE COMPASS
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        gutterBottom
                        sx={{ mb: 4 }}
                    >
                        Intelligent GATE CSIT Exam Preparation Platform
                    </Typography>

                    {(urlError || authError) && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {urlError ? getErrorMessage(urlError) : authError}
                        </Alert>
                    )}

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<GoogleIcon />}
                        onClick={handleGoogleLogin}
                        fullWidth
                        sx={{
                            py: 1.5,
                            textTransform: 'none',
                            fontSize: '1.1rem',
                        }}
                    >
                        Sign in with Google
                    </Button>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 3 }}
                    >
                        Sign in to access mock tests, trend analysis, and
                        personalized feedback
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginPage;
