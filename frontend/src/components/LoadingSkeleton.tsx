import React from 'react';
import { Box, Skeleton, Paper, Grid } from '@mui/material';

interface LoadingSkeletonProps {
    variant?: 'dashboard' | 'test' | 'results' | 'admin' | 'default';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = 'default' }) => {
    if (variant === 'dashboard') {
        return (
            <Box sx={{ p: 3 }}>
                <Skeleton variant="text" width="40%" height={60} sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3 }}>
                            <Skeleton variant="rectangular" height={120} />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3 }}>
                            <Skeleton variant="rectangular" height={120} />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3 }}>
                            <Skeleton variant="rectangular" height={120} />
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />
                            <Skeleton variant="rectangular" height={300} />
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    if (variant === 'test') {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Skeleton variant="text" width="30%" height={50} />
                    <Skeleton variant="rectangular" width={150} height={50} />
                </Box>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={9}>
                        <Paper sx={{ p: 3 }}>
                            <Skeleton variant="text" width="20%" height={30} sx={{ mb: 2 }} />
                            <Skeleton variant="text" width="100%" height={80} sx={{ mb: 3 }} />
                            <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
                            <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
                            <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
                            <Skeleton variant="rectangular" height={40} />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ p: 2 }}>
                            <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {[...Array(20)].map((_, i) => (
                                    <Skeleton key={i} variant="circular" width={40} height={40} />
                                ))}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    if (variant === 'results') {
        return (
            <Box sx={{ p: 3 }}>
                <Skeleton variant="text" width="40%" height={60} sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Skeleton variant="text" width="50%" height={40} sx={{ mb: 2 }} />
                            <Skeleton variant="rectangular" height={200} />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Skeleton variant="text" width="50%" height={40} sx={{ mb: 2 }} />
                            <Skeleton variant="rectangular" height={200} />
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
                            <Skeleton variant="text" width="100%" height={30} sx={{ mb: 1 }} />
                            <Skeleton variant="text" width="100%" height={30} sx={{ mb: 1 }} />
                            <Skeleton variant="text" width="100%" height={30} />
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    if (variant === 'admin') {
        return (
            <Box sx={{ p: 3 }}>
                <Skeleton variant="text" width="30%" height={60} sx={{ mb: 3 }} />
                <Paper sx={{ p: 3 }}>
                    <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" width={150} height={50} />
                </Paper>
            </Box>
        );
    }

    // Default skeleton
    return (
        <Box sx={{ p: 3 }}>
            <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="80%" height={30} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="70%" height={30} />
        </Box>
    );
};

export default LoadingSkeleton;
