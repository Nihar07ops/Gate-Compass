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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Code,
  Storage,
  Memory,
  Computer,
  NetworkCheck,
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
  const [detailedData, setDetailedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    fetchTrends();
    fetchDetailedTrends();
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

  const fetchDetailedTrends = async () => {
    try {
      const response = await api.get('/api/trends/detailed');
      setDetailedData(response.data);
    } catch (error) {
      console.error('Error fetching detailed trends:', error);
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

  const topicColors = {
    'Algorithms': '#667eea',
    'Data Structures': '#764ba2',
    'Operating Systems': '#f093fb',
    'DBMS': '#f5576c',
    'Computer Networks': '#4facfe',
    'Theory of Computation': '#00f2fe',
    'Compiler Design': '#43e97b',
    'Digital Logic': '#38f9d7',
    'Computer Organization': '#fa709a',
    'Discrete Mathematics': '#fee140',
    'Programming': '#30cfd0',
  };

  // Overall Topic Frequency Bar Chart
  const topicFrequencyData = {
    labels: trendsData?.topicFrequency?.map(t => t.topic) || [],
    datasets: [{
      label: 'Total Questions (2010-2024)',
      data: trendsData?.topicFrequency?.map(t => t.count) || [],
      backgroundColor: trendsData?.topicFrequency?.map(t => topicColors[t.topic] || '#667eea') || [],
      borderRadius: 8,
      borderWidth: 0,
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
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const percentage = ((context.parsed.y / trendsData.totalQuestions) * 100).toFixed(1);
            return `${context.parsed.y} questions (${percentage}%)`;
          }
        }
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
          font: { size: 11 },
          padding: 8,
          maxRotation: 45,
          minRotation: 45,
        }
      }
    },
  };

  // Year-wise Total Questions Line Chart
  const years = trendsData?.years || [];
  const yearTotals = years.map(year => trendsData?.yearTotals?.[year] || 0);

  const yearTrendData = {
    labels: years,
    datasets: [{
      label: 'Total Questions per Year',
      data: yearTotals,
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: '#667eea',
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
        titleFont: { size: 15, weight: 'bold' },
        bodyFont: { size: 14 },
        borderColor: '#667eea',
        borderWidth: 2,
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
          font: { size: 12, weight: '600' }
        }
      },
      x: {
        grid: {
          color: 'rgba(102, 126, 234, 0.05)',
        },
        ticks: {
          font: { size: 12, weight: '600' }
        }
      }
    },
  };

  // Subject-wise trend for selected topic
  const getTopicTrendData = (topic) => {
    const topicData = years.map(year => 
      trendsData?.topicWiseDistribution?.[year]?.[topic] || 0
    );

    return {
      labels: years,
      datasets: [{
        label: `${topic} - Questions per Year`,
        data: topicData,
        borderColor: topicColors[topic] || '#667eea',
        backgroundColor: `${topicColors[topic] || '#667eea'}20`,
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: topicColors[topic] || '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }]
    };
  };

  const mostFrequentTopic = trendsData?.topicFrequency?.[0];
  const totalQuestions = trendsData?.totalQuestions || 0;
  const avgQuestionsPerYear = (totalQuestions / years.length).toFixed(0);

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
                  GATE CSE Previous Year Analysis (2010-2024)
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
                📊 Comprehensive analysis of {totalQuestions} questions from {years.length} years of GATE CSE papers
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Key Insights */}
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
                  Analyzed from {years.length} years of GATE papers
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
                  {mostFrequentTopic?.count} questions ({((mostFrequentTopic?.count / totalQuestions) * 100).toFixed(1)}%)
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
                    <Typography variant="h3" fontWeight={800}>{years.length}</Typography>
                    <Typography variant="body1" fontWeight={600}>Years Analyzed</Typography>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  From {years[0]} to {years[years.length - 1]}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Overall Charts */}
      <Grid container spacing={3} mb={4}>
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
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <BarChart />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      Overall Topic Distribution
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total questions per topic (2010-2024)
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 3, opacity: 0.1 }} />
                <Box sx={{ height: 450 }}>
                  <Bar data={topicFrequencyData} options={barOptions} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

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
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    <ShowChart />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      Year-wise Trend
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total questions per year
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 3, opacity: 0.1 }} />
                <Box sx={{ height: 450 }}>
                  <Line data={yearTrendData} options={lineOptions} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Subject-wise Detailed Trends */}
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
            mb: 4,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar sx={{ width: 48, height: 48, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <Assessment />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={600}>
                  Subject-wise Detailed Trends
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Year-by-year breakdown for each subject
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 3, opacity: 0.1 }} />

            <Tabs 
              value={selectedTab} 
              onChange={(e, newValue) => setSelectedTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                mb: 3,
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontWeight: 600,
                }
              }}
            >
              {trendsData?.topicFrequency?.map((topic, index) => (
                <Tab 
                  key={index} 
                  label={topic.topic}
                  sx={{
                    color: topicColors[topic.topic],
                    '&.Mui-selected': {
                      color: topicColors[topic.topic],
                    }
                  }}
                />
              ))}
            </Tabs>

            {trendsData?.topicFrequency?.map((topic, index) => (
              selectedTab === index && (
                <Box key={index}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Box sx={{ height: 400 }}>
                        <Line 
                          data={getTopicTrendData(topic.topic)} 
                          options={{
                            ...lineOptions,
                            plugins: {
                              ...lineOptions.plugins,
                              legend: { display: false }
                            }
                          }} 
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, background: 'rgba(102, 126, 234, 0.05)' }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {topic.topic} Summary
                        </Typography>
                        <Divider sx={{ my: 2, opacity: 0.1 }} />
                        <Box display="flex" flexDirection="column" gap={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Total Questions
                            </Typography>
                            <Typography variant="h4" fontWeight={700} color={topicColors[topic.topic]}>
                              {topic.count}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Percentage of Total
                            </Typography>
                            <Typography variant="h5" fontWeight={600}>
                              {((topic.count / totalQuestions) * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                          <Chip 
                            label={topic.count > 200 ? "High Priority" : topic.count > 100 ? "Medium Priority" : "Low Priority"}
                            size="small"
                            sx={{
                              background: topic.count > 200 ? 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)' : 
                                         topic.count > 100 ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' :
                                         'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Subtopic Importance */}
                  {detailedData?.subjects?.[topic.topic] && (
                    <Box mt={3}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Subtopic-wise Importance
                      </Typography>
                      <TableContainer component={Paper} sx={{ background: 'rgba(102, 126, 234, 0.05)', mb: 3 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Subtopic</strong></TableCell>
                              <TableCell align="right"><strong>Questions</strong></TableCell>
                              <TableCell align="right"><strong>% of Subject</strong></TableCell>
                              <TableCell align="center"><strong>Priority</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(detailedData.subjects[topic.topic].subtopics || {})
                              .sort((a, b) => b[1] - a[1])
                              .map(([subtopic, count]) => {
                                const percentage = ((count / topic.count) * 100).toFixed(1);
                                const priority = count > topic.count * 0.15 ? 'High' : 
                                               count > topic.count * 0.08 ? 'Medium' : 'Low';
                                const priorityColor = priority === 'High' ? '#f5576c' : 
                                                     priority === 'Medium' ? '#4facfe' : '#43e97b';
                                return (
                                  <TableRow key={subtopic} hover>
                                    <TableCell>{subtopic}</TableCell>
                                    <TableCell align="right">
                                      <Chip 
                                        label={count} 
                                        size="small" 
                                        sx={{ 
                                          background: topicColors[topic.topic],
                                          color: 'white',
                                          minWidth: 40,
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell align="right">{percentage}%</TableCell>
                                    <TableCell align="center">
                                      <Chip 
                                        label={priority}
                                        size="small"
                                        sx={{
                                          background: priorityColor,
                                          color: 'white',
                                          fontWeight: 600,
                                          minWidth: 70,
                                        }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                  {/* Year-wise Table */}
                  <Box mt={3}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Year-wise Breakdown
                    </Typography>
                    <TableContainer component={Paper} sx={{ background: 'rgba(102, 126, 234, 0.05)' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Year</strong></TableCell>
                            <TableCell align="right"><strong>Questions</strong></TableCell>
                            <TableCell align="right"><strong>% of Year Total</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {years.map((year) => {
                            const count = trendsData?.topicWiseDistribution?.[year]?.[topic.topic] || 0;
                            const yearTotal = trendsData?.yearTotals?.[year] || 1;
                            const percentage = ((count / yearTotal) * 100).toFixed(1);
                            return (
                              <TableRow key={year} hover>
                                <TableCell>{year}</TableCell>
                                <TableCell align="right">
                                  <Chip 
                                    label={count} 
                                    size="small" 
                                    sx={{ 
                                      background: count > 0 ? topicColors[topic.topic] : 'grey',
                                      color: 'white',
                                      minWidth: 40,
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="right">{percentage}%</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Box>
              )
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default HistoricalTrends;
