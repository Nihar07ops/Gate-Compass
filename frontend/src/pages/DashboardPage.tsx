import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    AppBar,
    Toolbar,
    Paper,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    CardActions,
    useTheme,
    useMediaQuery,
    IconButton,
    Menu,
    MenuItem,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HistoryIcon from '@mui/icons-material/History';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { api, getErrorMessage } from '../utils/api';
import TrendVisualization from '../components/TrendVisualization';
import HistoricalPerformance from '../components/results/HistoricalPerformance';

/**
 * Dashboard page - main landing page with user statistics and quick actions
 * Requirements: 7.6
 */
const DashboardPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { showError, showSuccess } = useToast();
    const [isGeneratingTest, setIsGeneratingTest] = useState(false);
    const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

    const handleLogout = async () => {
        try {
            await logout();
            showSuccess('Logged out successfully');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            showError(getErrorMessage(error));
        }
    };

    const handleStartTest = async () => {
        setIsGeneratingTest(true);

        try {
            // Generate a new test with retry logic
            const testResponse = await api.post(
                '/api/tests/generate',
                {
                    questionCount: 65, // Standard GATE test
                    difficultyDistribution: {
                        easy: 20,
                        medium: 30,
                        hard: 15,
                    },
                },
                { withCredentials: true },
                { maxRetries: 2 }
            );

            const testId = testResponse.data.test.id;

            // Start a test session with retry logic
            const sessionResponse = await api.post(
                `/api/tests/${testId}/start`,
                {},
                { withCredentials: true },
                { maxRetries: 2 }
            );

            const sessionId = sessionResponse.data.sessionId;

            // Navigate to test page
            navigate(`/test/${sessionId}`);
        } catch (err: any) {
            console.error('Failed to start test:', err);
            showError(getErrorMessage(err));
            setIsGeneratingTest(false);
        }
    };

    const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMobileMenuAnchor(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMenuAnchor(null);
    };

    const navigateToSection = (section: string) => {
        handleMobileMenuClose();
        if (section === 'trends') {
            // Scroll to trends section
            document.getElementById('trends-section')?.scrollIntoView({ behavior: 'smooth' });
        } else if (section === 'history') {
            // Scroll to history section
            document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' });
        } else if (section === 'admin') {
            navigate('/admin');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Navigation Bar */}
            <AppBar position="static" elevation={2}>
                <Toolbar>
                    <DashboardIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        GATE COMPASS
                    </Typography>

                    {/* Desktop Navigation */}
                    {!isMobile && (
                        <>
                            <Button
                                color="inherit"
                                startIcon={<DashboardIcon />}
                                onClick={() => navigate('/dashboard')}
                                sx={{ mr: 1 }}
                            >
                                Dashboard
                            </Button>
                            <Button
                                color="inherit"
                                startIcon={<TrendingUpIcon />}
                                onClick={() => navigateToSection('trends')}
                                sx={{ mr: 1 }}
                            >
                                Trends
                            </Button>
                            <Button
                                color="inherit"
                                startIcon={<HistoryIcon />}
                                onClick={() => navigateToSection('history')}
                                sx={{ mr: 1 }}
                            >
                                History
                            </Button>
                            {user?.role === 'admin' && (
                                <Button
                                    color="inherit"
                                    startIcon={<AdminPanelSettingsIcon />}
                                    onClick={() => navigate('/admin')}
                                    sx={{ mr: 1 }}
                                >
                                    Admin
                                </Button>
                            )}
                            <Typography variant="body2" sx={{ mr: 2, opacity: 0.9 }}>
                                {user?.email}
                            </Typography>
                            <Button
                                color="inherit"
                                startIcon={<LogoutIcon />}
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        </>
                    )}

                    {/* Mobile Navigation */}
                    {isMobile && (
                        <>
                            <IconButton
                                color="inherit"
                                edge="end"
                                onClick={handleMobileMenuOpen}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                anchorEl={mobileMenuAnchor}
                                open={Boolean(mobileMenuAnchor)}
                                onClose={handleMobileMenuClose}
                            >
                                <MenuItem disabled>
                                    <Typography variant="body2" color="text.secondary">
                                        {user?.email}
                                    </Typography>
                                </MenuItem>
                                <MenuItem onClick={() => navigate('/dashboard')}>
                                    <DashboardIcon sx={{ mr: 1 }} /> Dashboard
                                </MenuItem>
                                <MenuItem onClick={() => navigateToSection('trends')}>
                                    <TrendingUpIcon sx={{ mr: 1 }} /> Trends
                                </MenuItem>
                                <MenuItem onClick={() => navigateToSection('history')}>
                                    <HistoryIcon sx={{ mr: 1 }} /> History
                                </MenuItem>
                                {user?.role === 'admin' && (
                                    <MenuItem onClick={() => navigateToSection('admin')}>
                                        <AdminPanelSettingsIcon sx={{ mr: 1 }} /> Admin
                                    </MenuItem>
                                )}
                                <MenuItem onClick={handleLogout}>
                                    <LogoutIcon sx={{ mr: 1 }} /> Logout
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: 4, px: { xs: 2, md: 3 } }}>
                {/* Welcome Section */}
                <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
                    <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom fontWeight="bold">
                        Welcome back!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Ready to ace your GATE exam? Start practicing with our intelligent mock tests.
                    </Typography>
                </Paper>

                {/* Quick Actions */}
                <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
                    Quick Actions
                </Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Card elevation={3} sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <PlayArrowIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">
                                        Start New Test
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Take a new 3-hour mock test with 65 questions based on trending concepts.
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ p: 2, pt: 0 }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    startIcon={isGeneratingTest ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                                    onClick={handleStartTest}
                                    disabled={isGeneratingTest}
                                >
                                    {isGeneratingTest ? 'Generating...' : 'Start Test'}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card elevation={3} sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <TrendingUpIcon color="success" sx={{ fontSize: 40, mr: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">
                                        View Trends
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Explore concept trends and see which topics are most important for GATE.
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ p: 2, pt: 0 }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    size="large"
                                    startIcon={<TrendingUpIcon />}
                                    onClick={() => navigateToSection('trends')}
                                >
                                    View Trends
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card elevation={3} sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <HistoryIcon color="info" sx={{ fontSize: 40, mr: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">
                                        Test History
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Review your past performance and track your improvement over time.
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ p: 2, pt: 0 }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    size="large"
                                    startIcon={<HistoryIcon />}
                                    onClick={() => navigateToSection('history')}
                                >
                                    View History
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>

                {/* Trends Section */}
                <Box id="trends-section" sx={{ mb: 4 }}>
                    <TrendVisualization />
                </Box>

                {/* Historical Performance Section */}
                {user?.userId && (
                    <Box id="history-section">
                        <HistoricalPerformance userId={user.userId} />
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default DashboardPage;
