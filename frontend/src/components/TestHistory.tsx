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
    Chip,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface TestResult {
    id: string;
    session_id: string;
    score: number;
    total_questions: number;
    percentage: number;
    created_at: string;
}

interface TestHistoryProps {
    userId: string;
    maxResults?: number;
    showTitle?: boolean;
}

/**
 * TestHistory component showing previous test attempts
 * Requirements: 7.6
 */
const TestHistory: React.FC<TestHistoryProps> = ({
    userId,
    maxResults,
    showTitle = true,
}) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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

            let results = response.data.history;
            if (maxResults && results.length > maxResults) {
                results = results.slice(0, maxResults);
            }

            setHistory(results);
        } catch (err: any) {
            console.error('Failed to fetch history:', err);
            setError(err.response?.data?.error || 'Failed to load test history');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (percentage: number): 'success' | 'warning' | 'error' => {
        if (percentage >= 80) return 'success';
        if (percentage >= 60) return 'warning';
        return 'error';
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        if (isMobile) {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
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

    return (
        <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
            {showTitle && (
                <Typography variant="h5" gutterBottom fontWeight="bold">
                    Recent Tests
                </Typography>
            )}

            {/* Mobile View - Cards */}
            {isMobile ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {history.map((result) => (
                        <Paper
                            key={result.id}
                            variant="outlined"
                            sx={{ p: 2 }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {formatDate(result.created_at)}
                                </Typography>
                                <Chip
                                    label={`${result.percentage.toFixed(1)}%`}
                                    color={getScoreColor(result.percentage)}
                                    size="small"
                                />
                            </Box>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                Score: {result.score} / {result.total_questions}
                            </Typography>
                            <Button
                                size="small"
                                variant="outlined"
                                fullWidth
                                startIcon={<VisibilityIcon />}
                                onClick={() => navigate(`/results/${result.session_id}`)}
                            >
                                View Details
                            </Button>
                        </Paper>
                    ))}
                </Box>
            ) : (
                /* Desktop View - Table */
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
                                <TableRow key={result.id} hover>
                                    <TableCell>
                                        {formatDate(result.created_at)}
                                    </TableCell>
                                    <TableCell align="center">
                                        {result.score} / {result.total_questions}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={`${result.percentage.toFixed(1)}%`}
                                            color={getScoreColor(result.percentage)}
                                            size="small"
                                        />
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
            )}
        </Paper>
    );
};

export default TestHistory;
