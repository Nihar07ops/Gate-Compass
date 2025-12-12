import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  Paper,
  Chip,
  Divider,
  Avatar,
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
    <Box sx={{ position: 'relative' }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 4,
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          <Box position="relative" zIndex={1}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp sx={{ fontSize: 36 }} />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight={700}>
                  Historical Trends
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.95 }}>
                  GATE CSE exam patterns and trends over the years
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                mt: 3,
                p: 2,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" sx={{ opacity: 0.95 }}>
                📊 Analyzing 10+ years of GATE data to help you focus on high-frequency topics
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Enhanced Insight Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05, y: -8 }}
          >
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ width: 56, height: 56, background: 'rgba(255, 255, 255, 0.2)' }}>
                    <Assessment sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" fontWeight={800}>{totalQuestions}</Typography>
                    <Typography variant="body1" fontWeight={600}>Total Questions</Typography>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Analyzed from past GATE papers
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -8 }}
          >
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)',
            }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                  <Avatar sx={{ width: 56, height: 56, background: 'rgba(255, 255, 255, 0.2)', flexShrink: 0 }}>
                    <TrendingUp sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography 
                      variant="h5" 
                      fontWeight={800}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.2,
                        mb: 0.5,
                      }}
                    >
                      {mostFrequentTopic?.topic || 'N/A'}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.9 }}>
                      Most Frequent Topic
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mt: 1 }}>
                  Focus on this high-priority topic
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, y: -8 }}
          >
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)',
            }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ width: 56, height: 56, background: 'rgba(255, 255, 255, 0.2)' }}>
                    <ShowChart sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" fontWeight={800}>{avgDifficulty}/5</Typography>
                    <Typography variant="body1" fontWeight={600}>Avg Difficulty</Typography>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Moderate challenge level
                </Typography>
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
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(102, 126, 234, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: '1px solid rgba(102, 126, 234, 0.5)',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <BarChart />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      Topic Frequency
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Question distribution analysis
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 3, opacity: 0.1 }} />
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
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(118, 75, 162, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: '1px solid rgba(118, 75, 162, 0.5)',
                  boxShadow: '0 8px 32px rgba(118, 75, 162, 0.2)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    <ShowChart />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      Difficulty Trend
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Year-wise difficulty analysis
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 3, opacity: 0.1 }} />
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
            <Card 
              elevation={0}
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(102, 126, 234, 0.2)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar sx={{ width: 48, height: 48, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                    <Assessment />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      Topic-wise Breakdown
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Detailed analysis of all topics
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 3, opacity: 0.1 }} />
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
