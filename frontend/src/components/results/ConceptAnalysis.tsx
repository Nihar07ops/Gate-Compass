import React, { useMemo } from 'react';
import {
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface ConceptPerformance {
    concept_id: string;
    concept_name: string;
    total_questions: number;
    correct_answers: number;
    accuracy: number;
    average_time_per_question: number;
}

interface ConceptAnalysisProps {
    conceptPerformance: ConceptPerformance[];
}

/**
 * Concept analysis component with performance charts
 * Requirements: 7.3
 * Optimized with React.memo and useMemo for performance
 */
const ConceptAnalysis: React.FC<ConceptAnalysisProps> = ({ conceptPerformance }) => {
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const getAccuracyColor = (accuracy: number): string => {
        if (accuracy >= 0.8) return '#4caf50'; // Green
        if (accuracy >= 0.6) return '#ff9800'; // Orange
        if (accuracy >= 0.4) return '#ff5722'; // Deep Orange
        return '#f44336'; // Red
    };

    // Memoize chart data to avoid recalculation on every render
    const chartData = useMemo(() => ({
        labels: conceptPerformance.map(cp => cp.concept_name),
        datasets: [
            {
                label: 'Accuracy (%)',
                data: conceptPerformance.map(cp => cp.accuracy * 100),
                backgroundColor: conceptPerformance.map(cp => getAccuracyColor(cp.accuracy)),
                borderColor: conceptPerformance.map(cp => getAccuracyColor(cp.accuracy)),
                borderWidth: 1,
            },
        ],
    }), [conceptPerformance]);

    // Memoize chart options
    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Concept-wise Accuracy',
                font: {
                    size: 16,
                },
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        return `Accuracy: ${context.parsed.y.toFixed(1)}%`;
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
    }), []);

    return (
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
                Concept-wise Performance
            </Typography>

            {/* Chart */}
            <Box sx={{ height: 300, mb: 3 }}>
                <Bar data={chartData} options={chartOptions} />
            </Box>

            {/* Detailed Table */}
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Concept</strong></TableCell>
                            <TableCell align="center"><strong>Questions</strong></TableCell>
                            <TableCell align="center"><strong>Correct</strong></TableCell>
                            <TableCell align="center"><strong>Accuracy</strong></TableCell>
                            <TableCell align="center"><strong>Avg Time</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {conceptPerformance.map((cp) => {
                            return (
                                <TableRow key={cp.concept_id}>
                                    <TableCell>{cp.concept_name}</TableCell>
                                    <TableCell align="center">{cp.total_questions}</TableCell>
                                    <TableCell align="center">{cp.correct_answers}</TableCell>
                                    <TableCell align="center">
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">
                                                {(cp.accuracy * 100).toFixed(1)}%
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={cp.accuracy * 100}
                                                sx={{
                                                    mt: 0.5,
                                                    height: 6,
                                                    borderRadius: 3,
                                                    bgcolor: 'grey.200',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: getAccuracyColor(cp.accuracy),
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        {formatTime(cp.average_time_per_question)}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default React.memo(ConceptAnalysis);
