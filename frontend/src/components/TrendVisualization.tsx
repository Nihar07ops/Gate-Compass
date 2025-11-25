import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Grid,
    Card,
    CardContent,
    Chip,
    SelectChangeEvent,
    Alert,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useToast } from '../contexts/ToastContext';
import { api, getErrorMessage } from '../utils/api';
import LoadingSkeleton from './LoadingSkeleton';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

interface ConceptRanking {
    concept_id: string;
    concept_name: string;
    rank: number;
    frequency: number;
    importance: number;
    yearly_distribution: Record<number, number>;
}

interface TrendData {
    rankings: ConceptRanking[];
    last_updated: string;
    total_questions: number;
}

type SortOption = 'rank' | 'frequency' | 'importance' | 'name';
type SortOrder = 'asc' | 'desc';

const TrendVisualization: React.FC = () => {
    const { showError } = useToast();
    const [trendData, setTrendData] = useState<TrendData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [sortBy, setSortBy] = useState<SortOption>('rank');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

    useEffect(() => {
        fetchTrendData();
    }, []);

    const fetchTrendData = async () => {
        setLoading(true);

        try {
            const response = await api.get<TrendData>(
                '/api/trends',
                { withCredentials: true },
                { maxRetries: 2 }
            );
            setTrendData(response.data);
        } catch (err: any) {
            console.error('Error fetching trend data:', err);
            showError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort rankings
    const filteredAndSortedRankings = useMemo(() => {
        if (!trendData) return [];

        let filtered = trendData.rankings;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((ranking) =>
                ranking.concept_name.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'rank':
                    comparison = a.rank - b.rank;
                    break;
                case 'frequency':
                    comparison = a.frequency - b.frequency;
                    break;
                case 'importance':
                    comparison = a.importance - b.importance;
                    break;
                case 'name':
                    comparison = a.concept_name.localeCompare(b.concept_name);
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return sorted;
    }, [trendData, searchQuery, sortBy, sortOrder]);

    // Prepare data for concept rankings bar chart
    const rankingsChartData = useMemo(() => {
        const topRankings = filteredAndSortedRankings.slice(0, 15);

        return {
            labels: topRankings.map((r) => r.concept_name),
            datasets: [
                {
                    label: 'Importance Score',
                    data: topRankings.map((r) => r.importance),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Frequency',
                    data: topRankings.map((r) => r.frequency),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                },
            ],
        };
    }, [filteredAndSortedRankings]);

    const rankingsChartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Top Concepts by Importance and Frequency',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    // Prepare data for yearly distribution line chart
    const yearlyDistributionChartData = useMemo(() => {
        if (!selectedConcept || !trendData) {
            return null;
        }

        const concept = trendData.rankings.find(
            (r) => r.concept_id === selectedConcept
        );

        if (!concept || !concept.yearly_distribution) {
            return null;
        }

        const years = Object.keys(concept.yearly_distribution)
            .map(Number)
            .sort((a, b) => a - b);
        const counts = years.map((year) => concept.yearly_distribution[year]);

        return {
            labels: years.map(String),
            datasets: [
                {
                    label: `${concept.concept_name} - Questions per Year`,
                    data: counts,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.3,
                    fill: true,
                },
            ],
        };
    }, [selectedConcept, trendData]);

    const yearlyDistributionChartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Yearly Distribution of Questions',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };

    const handleSortByChange = (event: SelectChangeEvent<SortOption>) => {
        setSortBy(event.target.value as SortOption);
    };

    const handleSortOrderChange = (event: SelectChangeEvent<SortOrder>) => {
        setSortOrder(event.target.value as SortOrder);
    };

    const handleConceptClick = (conceptId: string) => {
        setSelectedConcept(conceptId === selectedConcept ? null : conceptId);
    };

    if (loading) {
        return <LoadingSkeleton variant="dashboard" />;
    }

    if (!trendData || trendData.rankings.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="info">
                    No trend data available. Please add questions to the system first.
                </Alert>
            </Box>
        );
    }

    return (
        <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon fontSize="large" />
                Concept Trends Analysis
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                            Total Questions
                        </Typography>
                        <Typography variant="h6">{trendData.total_questions}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                            Total Concepts
                        </Typography>
                        <Typography variant="h6">{trendData.rankings.length}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                            Last Updated
                        </Typography>
                        <Typography variant="body1">
                            {new Date(trendData.last_updated).toLocaleDateString()}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Filters and Sorting */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            label="Search Concepts"
                            variant="outlined"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type to search..."
                        />
                    </Grid>
                    <Grid item xs={12} sm={3} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Sort By</InputLabel>
                            <Select value={sortBy} label="Sort By" onChange={handleSortByChange}>
                                <MenuItem value="rank">Rank</MenuItem>
                                <MenuItem value="importance">Importance</MenuItem>
                                <MenuItem value="frequency">Frequency</MenuItem>
                                <MenuItem value="name">Name</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Order</InputLabel>
                            <Select value={sortOrder} label="Order" onChange={handleSortOrderChange}>
                                <MenuItem value="asc">Ascending</MenuItem>
                                <MenuItem value="desc">Descending</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* Bar Chart for Rankings */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ height: 400 }}>
                    <Bar data={rankingsChartData} options={rankingsChartOptions} />
                </Box>
            </Paper>

            {/* Yearly Distribution Chart (shown when concept is selected) */}
            {selectedConcept && yearlyDistributionChartData && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ height: 300 }}>
                        <Line
                            data={yearlyDistributionChartData}
                            options={yearlyDistributionChartOptions}
                        />
                    </Box>
                </Paper>
            )}

            {/* Concept Rankings List */}
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
                Concept Rankings
                {searchQuery && (
                    <Chip
                        label={`${filteredAndSortedRankings.length} results`}
                        size="small"
                        sx={{ ml: 2 }}
                    />
                )}
            </Typography>

            <Grid container spacing={2}>
                {filteredAndSortedRankings.map((ranking) => (
                    <Grid item xs={12} sm={6} md={4} key={ranking.concept_id}>
                        <Card
                            sx={{
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: selectedConcept === ranking.concept_id ? 2 : 0,
                                borderColor: 'primary.main',
                                '&:hover': {
                                    boxShadow: 4,
                                    transform: 'translateY(-2px)',
                                },
                            }}
                            onClick={() => handleConceptClick(ranking.concept_id)}
                        >
                            <CardContent>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={1}
                                >
                                    <Typography variant="h6" component="div">
                                        #{ranking.rank}
                                    </Typography>
                                    <Chip
                                        label={`${(ranking.importance * 100).toFixed(1)}%`}
                                        color="primary"
                                        size="small"
                                    />
                                </Box>
                                <Typography variant="body1" fontWeight="bold" gutterBottom>
                                    {ranking.concept_name}
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Frequency: {(ranking.frequency * 100).toFixed(2)}%
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Questions:{' '}
                                        {Object.values(ranking.yearly_distribution || {}).reduce(
                                            (sum, count) => sum + count,
                                            0
                                        )}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {filteredAndSortedRankings.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                        No concepts found matching your search.
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default TrendVisualization;
