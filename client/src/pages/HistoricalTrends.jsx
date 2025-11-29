import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  CircularProgress,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { 
  Timeline, 
  TrendingUp, 
  BarChart, 
  ShowChart,
  Assessment,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../utils/api';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
);

const HistoricalTrends = () => {
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const response = await api.get('/api/trends');
      setTrendsData(response.data);
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Timeline sx={{ fontSize: 64, color: '#667eea' }} />
        </motion.div>
        <Typography variant="h6" mt={2} color="text.secondary">
          Analyzing historical trends...
        </Typography>
      </Box>
    );
  }

  // Simplified Topic Frequency Bar Chart
  const topicFrequencyData = {
    labels: trendsData?.topicFrequency?.map(t => t.topic) || [],
    datasets: [{
      label: 'Questions Asked',
      data: trendsData?.topicFrequency?.map(t => t.count) || [],
      backgroundColor: 'rgba(102, 126, 234, 0.7)',
      borderColor: '#667eea',
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(102, 126, 234, 0.1)',
        },
        ticks: {
          font: { size: 12 },
          padding: 8,
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 12 },
          padding: 8,
        }
      }
    },
  };

  // Simplified Difficulty Trend Line Chart
  const difficultyTrendData = {
    labels: trendsData?.years || [],
    datasets: [{
      label: 'Difficulty Level',
      data: trendsData?.difficultyTrend || [],
      borderColor: '#764ba2',
      backgroundColor: 'rgba(118, 75, 162, 0.1)',
      borderWidth: 3,
      tension: 0.3,
      fill: true,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: '#764ba2',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 12,
        titleFont: {
          size: 15,
          weight: 'bold',
        },
        bodyFont: {
          size: 14,
        },
        borderColor: '#667eea',
        borderWidth: 2,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        grid: {
          color: 'rgba(102, 126, 234, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 12,
            weight: '600',
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(102, 126, 234, 0.05)',
        },
        ticks: {
          font: {
            size: 12,
            weight: '600',
          }
        }
      }
    },
  };

  // Calculate insights
  const mostFrequentTopic = trendsData?.topicFrequency?.[0];
  const totalQuestions = trendsData?.totalQuestions || 0;
  const avgDifficulty = trendsData?.difficultyTrend?.length > 0
    ? (trendsData.difficultyTrend.reduce((a, b) => a + b, 0) / trendsData.difficultyTrend.length).toFixed(2)
    : 0;

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Box mb={4}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Historical Trends 📈
          </Typography>
          <Typography variant="h6" color="text.secondary">
            GATE CSE exam patterns and trends over the years
          </Typography>
        </Box>
      </motion.div>

      {/* Insight Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>{totalQuestions}</Typography>
                    <Typography variant="body2">Total Questions</Typography>
                  </Box>
                  <Assessment sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>{mostFrequentTopic?.topic || 'N/A'}</Typography>
                    <Typography variant="body2">Most Frequent Topic</Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>{avgDifficulty}/5</Typography>
                    <Typography variant="body2">Average Difficulty</Typography>
                  </Box>
                  <ShowChart sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Topic Frequency Bar Chart */}
        <Grid item xs={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card elevation={4} sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <BarChart sx={{ mr: 1, color: '#667eea', fontSize: 28 }} />
                  <Typography variant="h5" fontWeight={600}>
                    Topic Frequency
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Distribution of questions across different topics in GATE CSE
                </Typography>
                <Box sx={{ height: 400 }}>
                  <Bar data={topicFrequencyData} options={barOptions} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Difficulty Trend Line Chart */}
        <Grid item xs={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card elevation={4} sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <ShowChart sx={{ mr: 1, color: '#764ba2', fontSize: 28 }} />
                  <Typography variant="h5" fontWeight={600}>
                    Difficulty Trend
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Average difficulty level of GATE CSE papers over the years
                </Typography>
                <Box sx={{ height: 400 }}>
                  <Line data={difficultyTrendData} options={lineOptions} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Topic Breakdown */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card elevation={4}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Topic-wise Breakdown
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  {trendsData?.topicFrequency?.map((topic, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Paper 
                          elevation={2} 
                          sx={{ 
                            p: 2,
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              border: '1px solid #667eea',
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                            }
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight={600}>
                              {topic.topic}
                            </Typography>
                            <Chip 
                              label={`${topic.count} Q`}
                              size="small"
                              sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary" mt={1} display="block">
                            {((topic.count / totalQuestions) * 100).toFixed(1)}% of total questions
                          </Typography>
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HistoricalTrends;
