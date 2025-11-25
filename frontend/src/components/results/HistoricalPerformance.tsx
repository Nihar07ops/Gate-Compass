import React, { useEffect, useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface TestResult {
    id: string;
    session_id: string;
    score: number;
    total_questions: number;
    percentage: number;
    created_at: string;
}

interface HistoricalPerformanceProps {
    userId: string;
}

/**
 * Historical performance view with trend charts
 * Requirements: 7.6
 */
const HistoricalPerformance: React.FC<HistoricalPerformanceProps> = ({ userId }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<TestResult[]>([]);

    useEffect(() => {
        fetchHistory();
    }, [userId]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get<{ history: TestResult[] }>(
                `/api/results/user/${userId}/history`,
                { withCredentials: true }
            );

            setHistory(response.data.history);
        } catch (err: any) {
            console.error('Failed to fetch history:', err);
            setError(err.response?.data?.error || 'Failed to load test history');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Paper elevation={2} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress />
                </Box>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper elevation={2} sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Paper>
        );
    }

    if (history.length === 0) {
        return (
            <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="body1" color="text.secondary" align="center">
                    No test history available yet. Take your first test to see your progress!
                </Typography>
            </Paper>
        );
    }

    // Prepare chart data (reverse to show oldest to newest)
    const reversedHistory = [...history].reverse();
    const chartData = {
        labels: reversedHistory.map((_, index) => `Test ${index + 1}`),
        datasets: [
            {
                label: 'Score (%)',
                data: reversedHistory.map(result => result.percentage),
                borderColor: '#1976d2',
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                tension: 0.3,
                fill: true,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Performance Trend',
                font: {
                    size: 16,
                },
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        return `Score: ${context.parsed.y.toFixed(1)}%`;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: (value: any) => `${value}%`,
                },
            },
        },
    };

    // Calculate statistics
    const averageScore = history.reduce((sum, result) => sum + result.percentage, 0) / history.length;
    const highestScore = Math.max(...history.map(result => result.percentage));
    const latestScore = history[0].percentage;
    const improvement = history.length > 1 ? latestScore - history[history.length - 1].percentage : 0;

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Test History & Progress
            </Typography>

            {/* Statistics Summary */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 150, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Tests Taken
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                        {history.length}
                    </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 150, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Average Score
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                        {averageScore.toFixed(1)}%
                    </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 150, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Highest Score
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                        {highestScore.toFixed(1)}%
                    </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 150, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Improvement
                    </Typography>
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        color={improvement >= 0 ? 'success.main' : 'error.main'}
                    >
                        {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}%
                    </Typography>
                </Box>
            </Box>

            {/* Trend Chart */}
            <Box sx={{ height: 300, mb: 3 }}>
                <Line data={chartData} options={chartOptions} />
            </Box>

            {/* Test History Table */}
            <Typography variant="h6" gutterBottom>
                Recent Tests
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell align="center"><strong>Score</strong></TableCell>
                            <TableCell align="center"><strong>Percentage</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {history.map((result) => (
                            <TableRow key={result.id}>
                                <TableCell>
                                    {new Date(result.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </TableCell>
                                <TableCell align="center">
                                    {result.score} / {result.total_questions}
                                </TableCell>
                                <TableCell align="center">
                                    <Typography
                                        fontWeight="bold"
                                        color={
                                            result.percentage >= 80
                                                ? 'success.main'
                                                : result.percentage >= 60
                                                    ? 'warning.main'
                                                    : 'error.main'
                                        }
                                    >
                                        {result.percentage.toFixed(1)}%
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Button
                                        size="small"
                                        startIcon={<VisibilityIcon />}
                                        onClick={() => navigate(`/results/${result.session_id}`)}
                                    >
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default HistoricalPerformance;
