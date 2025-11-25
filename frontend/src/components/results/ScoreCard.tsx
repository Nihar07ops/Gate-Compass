import React, { useMemo } from 'react';
import {
    Paper,
    Typography,
    Box,
    Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TimerIcon from '@mui/icons-material/Timer';

interface ScoreCardProps {
    result: {
        score: number;
        total_questions: number;
        correct_answers: number;
        incorrect_answers: number;
        unanswered: number;
        percentage: number;
    };
    session: {
        start_time: string;
        end_time: string;
        total_time_spent: number;
    };
}

/**
 * Score card component displaying overall test performance
 * Requirements: 7.1
 * Optimized with React.memo and useMemo for performance
 */
const ScoreCard: React.FC<ScoreCardProps> = ({ result, session }) => {
    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}h ${minutes}m ${secs}s`;
    };

    const getScoreColor = (percentage: number): string => {
        if (percentage >= 80) return '#4caf50'; // Green
        if (percentage >= 60) return '#ff9800'; // Orange
        if (percentage >= 40) return '#ff5722'; // Deep Orange
        return '#f44336'; // Red
    };

    // Memoize formatted time to avoid recalculation
    const formattedTime = useMemo(() => formatTime(session.total_time_spent), [session.total_time_spent]);

    // Memoize score color
    const scoreColor = useMemo(() => getScoreColor(result.percentage), [result.percentage]);

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom align="center">
                Test Results
            </Typography>

            {/* Main Score Display */}
            <Box
                sx={{
                    textAlign: 'center',
                    py: 3,
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: 'background.default',
                }}
            >
                <Typography
                    variant="h1"
                    sx={{
                        fontWeight: 'bold',
                        color: scoreColor,
                        fontSize: { xs: '3rem', md: '4rem' },
                    }}
                >
                    {result.percentage.toFixed(1)}%
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Score: {result.score} / {result.total_questions}
                </Typography>
            </Box>

            {/* Detailed Breakdown */}
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <Box
                        sx={{
                            p: 2,
                            textAlign: 'center',
                            borderRadius: 2,
                            bgcolor: '#e8f5e9',
                        }}
                    >
                        <CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold">
                            {result.correct_answers}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Correct
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Box
                        sx={{
                            p: 2,
                            textAlign: 'center',
                            borderRadius: 2,
                            bgcolor: '#ffebee',
                        }}
                    >
                        <CancelIcon sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold">
                            {result.incorrect_answers}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Incorrect
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Box
                        sx={{
                            p: 2,
                            textAlign: 'center',
                            borderRadius: 2,
                            bgcolor: '#fff3e0',
                        }}
                    >
                        <HelpOutlineIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold">
                            {result.unanswered}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Unanswered
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Box
                        sx={{
                            p: 2,
                            textAlign: 'center',
                            borderRadius: 2,
                            bgcolor: '#e3f2fd',
                        }}
                    >
                        <TimerIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
                        <Typography variant="h6" fontWeight="bold">
                            {formattedTime}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Time Taken
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* Test Date */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Completed on {new Date(session.end_time).toLocaleString()}
                </Typography>
            </Box>
        </Paper>
    );
};

export default React.memo(ScoreCard);
