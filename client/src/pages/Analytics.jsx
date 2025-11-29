import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  CircularProgress,
  Paper,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material';
import { 
  Radar, 
  Doughnut, 
  Line, 
  Bar 
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { 
  TrendingUp, 
  Assessment, 
  EmojiEvents, 
  Speed,
  CheckCircle,
  Cancel,
  RemoveCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../utils/api';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
          <Assessment sx={{ fontSize: 64, color: '#667eea' }} />
        </motion.div>
        <Typography variant="h6" mt={2} color="text.secondary">
          Analyzing your performance...
        </Typography>
      </Box>
    );
  }

  // Enhanced Chart configurations
  const performanceData = {
    labels: analytics?.topicPerformance?.map(t => t.topic) || [],
    datasets: [{
      label: 'Your Performance',
      data: analytics?.topicPerformance?.map(t => t.score) || [],
      backgroundColor: 'rgba(102, 126, 234, 0.25)',
      borderColor: '#667eea',
      borderWidth: 3,
      pointBackgroundColor: '#667eea',
      pointBorderColor: '#fff',
      pointBorderWidth: 3,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#667eea',
      pointRadius: 6,
      pointHoverRadius: 8,
    }]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
          font: { size: 13, weight: '500' },
          color: '#666',
        },
        grid: {
          color: 'rgba(102, 126, 234, 0.2)',
          lineWidth: 1.5,
        },
        angleLines: {
          color: 'rgba(102, 126, 234, 0.2)',
          lineWidth: 1.5,
        },
        pointLabels: {
          font: { size: 14, weight: '600' },
          color: '#667eea',
          padding: 15,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 14, weight: '600' },
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 15,
        titleFont: { size: 15, weight: 'bold' },
        bodyFont: { size: 14 },
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `Score: ${context.parsed.r}%`;
          }
        }
      }
    },
  };

  const accuracyData = {
    labels: ['Correct', 'Incorrect', 'Unattempted'],
    datasets: [{
      data: [analytics?.correct || 0, analytics?.incorrect || 0, analytics?.unattempted || 0],
      backgroundColor: [
        'rgba(76, 175, 80, 0.8)',
        'rgba(244, 67, 54, 0.8)',
        'rgba(255, 152, 0, 0.8)',
      ],
      borderColor: [
        '#4caf50',
        '#f44336',
        '#ff9800',
      ],
      borderWidth: 3,
      hoverOffset: 15,
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        borderColor: '#667eea',
        borderWidth: 2,
      }
    },
  };

  // Bar chart for topic comparison
  const barData = {
    labels: analytics?.topicPerformance?.map(t => t.topic) || [],
    datasets: [{
      label: 'Score',
      data: analytics?.topicPerformance?.map(t => t.score) || [],
      backgroundColor: analytics?.topicPerformance?.map((_, i) => {
        const colors = [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(240, 147, 251, 0.8)',
          'rgba(245, 87, 108, 0.8)',
          'rgba(79, 172, 254, 0.8)',
        ];
        return colors[i % colors.length];
      }),
      borderColor: analytics?.topicPerformance?.map((_, i) => {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
        return colors[i % colors.length];
      }),
      borderWidth: 2,
      borderRadius: 8,
      barThickness: 40,
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        borderColor: '#667eea',
        borderWidth: 2,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(102, 126, 234, 0.1)',
        },
        ticks: {
          font: {
            size: 12,
            weight: '600',
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: '600',
          }
        }
      }
    },
  };

  const totalQuestions = (analytics?.correct || 0) + (analytics?.incorrect || 0) + (analytics?.unattempted || 0);
  const accuracy = totalQuestions > 0 ? ((analytics?.correct || 0) / totalQuestions * 100).toFixed(1) : 0;

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Box mb={4}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Performance Analytics 📊
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Detailed insights into your preparation journey
          </Typography>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              color: 'white',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight={700}>{analytics?.correct || 0}</Typography>
                    <Typography variant="body2">Correct Answers</Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f44336 0%, #e53935 100%)',
              color: 'white',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight={700}>{analytics?.incorrect || 0}</Typography>
                    <Typography variant="body2">Incorrect Answers</Typography>
                  </Box>
                  <Cancel sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Card sx={{ 
              background: 'linear-gradient(135deg, #ff9800 0%, #fb8c00 100%)',
              color: 'white',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight={700}>{analytics?.unattempted || 0}</Typography>
                    <Typography variant="body2">Unattempted</Typography>
                  </Box>
                  <RemoveCircle sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight={700}>{accuracy}%</Typography>
                    <Typography variant="body2">Accuracy Rate</Typography>
                  </Box>
                  <Speed sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Radar Chart - Full Width */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card elevation={4}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                  <Box display="flex" alignItems="center">
                    <Assessment sx={{ mr: 1.5, color: '#667eea', fontSize: 32 }} />
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        Topic-wise Performance
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        Your performance across different topics
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label={`${analytics?.topicPerformance?.length || 0} Topics`}
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Divider sx={{ mb: 4 }} />
                <Box sx={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Radar data={performanceData} options={radarOptions} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Doughnut Chart */}
        <Grid item xs={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card elevation={4} sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingUp sx={{ mr: 1, color: '#764ba2', fontSize: 28 }} />
                  <Typography variant="h5" fontWeight={600}>
                    Overall Accuracy
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <Doughnut data={accuracyData} options={doughnutOptions} />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h3" fontWeight={700} color="primary">
                      {accuracy}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Accuracy
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Bar Chart */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card elevation={4}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <EmojiEvents sx={{ mr: 1, color: '#ffd700', fontSize: 28 }} />
                  <Typography variant="h5" fontWeight={600}>
                    Score Comparison
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: 350 }}>
                  <Bar data={barData} options={barOptions} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Detailed Topic Breakdown */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card elevation={4}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Detailed Topic Analysis
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  {analytics?.topicPerformance?.map((topic, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Paper 
                        elevation={2} 
                        sx={{ 
                          p: 2,
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                          border: '1px solid rgba(102, 126, 234, 0.2)',
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {topic.topic}
                          </Typography>
                          <Chip 
                            label={`${topic.score}%`}
                            color={topic.score >= 75 ? 'success' : topic.score >= 50 ? 'warning' : 'error'}
                            size="small"
                          />
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={topic.score} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: topic.score >= 75
                                ? 'linear-gradient(90deg, #4caf50 0%, #45a049 100%)'
                                : topic.score >= 50
                                ? 'linear-gradient(90deg, #ff9800 0%, #fb8c00 100%)'
                                : 'linear-gradient(90deg, #f44336 0%, #e53935 100%)',
                            }
                          }}
                        />
                      </Paper>
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

export default Analytics;
