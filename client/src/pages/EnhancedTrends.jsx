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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  ButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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
  School,
  DateRange,
  ExpandMore,
  FilterList,
  Analytics,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../utils/api';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

const EnhancedTrends = () => {
  const [trendsData, setTrendsData] = useState(null);
  const [yearwiseData, setYearwiseData] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedYearRange, setSelectedYearRange] = useState('2015-2024');
  const [viewMode, setViewMode] = useState('overview');

  const subjects = [
    'Algorithms', 'Data Structures', 'Operating Systems', 'DBMS',
    'Computer Networks', 'Theory of Computation', 'Compiler Design',
    'Digital Logic', 'Computer Organization', 'Discrete Mathematics',
    'Programming', 'General Aptitude', 'Engineering Mathematics'
  ];

  useEffect(() => {
    fetchAllTrends();
  }, []);

  const fetchAllTrends = async () => {
    try {
      setLoading(true);
      
      // Fetch overview trends
      const overviewResponse = await api.get('/api/trends');
      setTrendsData(overviewResponse.data);
      
      // Fetch year-wise analysis
      const yearwiseResponse = await api.get('/api/trends/yearwise');
      setYearwiseData(yearwiseResponse.data);
      
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectData = async (subject) => {
    try {
      const response = await api.get(`/api/trends/subject/${encodeURIComponent(subject)}`);
      setSubjectData(response.data);
    } catch (error) {
      console.error('Error fetching subject data:', error);
    }
  };

  const handleSubjectChange = (event) => {
    const subject = event.target.value;
    setSelectedSubject(subject);
    if (subject) {
      fetchSubjectData(subject);
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Analytics sx={{ fontSize: 64, color: '#667eea' }} />
        </motion.div>
        <Typography variant="h6" mt={2} color="text.secondary">
          Analyzing comprehensive GATE trends...
        </Typography>
      </Box>
    );
  }

  // Year-wise overview chart
  const yearwiseOverviewData = {
    labels: yearwiseData?.overallTrends?.map(t => t.year) || [],
    datasets: [
      {
        label: 'Total Questions',
        data: yearwiseData?.overallTrends?.map(t => t.totalQuestions) || [],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 3,
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Average Difficulty',
        data: yearwiseData?.overallTrends?.map(t => t.averageDifficulty * 20) || [], // Scale for visibility
        borderColor: '#f093fb',
        backgroundColor: 'rgba(240, 147, 251, 0.1)',
        borderWidth: 3,
        tension: 0.3,
        yAxisID: 'y1',
      }
    ]
  };

  // Subject distribution pie chart
  const subjectDistributionData = {
    labels: Object.keys(trendsData?.localData?.subjectWiseBreakdown || {}),
    datasets: [{
      data: Object.values(trendsData?.localData?.subjectWiseBreakdown || {}).map(s => s.total),
      backgroundColor: [
        '#667eea', '#f093fb', '#4facfe', '#43e97b', '#f5576c',
        '#764ba2', '#38f9d7', '#ffecd2', '#fcb69f', '#a8edea',
        '#fed6e3', '#d299c2', '#fef9d7'
      ],
      borderWidth: 2,
      borderColor: '#fff',
    }]
  };

  // Topic trends for selected subject
  const getSubjectTopicTrends = () => {
    if (!subjectData?.data?.topicTrends) return null;
    
    const topics = Object.keys(subjectData.data.topicTrends);
    const years = subjectData.data.topicTrends[topics[0]]?.data?.map(d => d.year) || [];
    
    return {
      labels: years,
      datasets: topics.slice(0, 5).map((topic, index) => ({
        label: topic,
        data: subjectData.data.topicTrends[topic]?.data?.map(d => d.count) || [],
        borderColor: ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#f5576c'][index],
        backgroundColor: ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#f5576c'][index] + '20',
        borderWidth: 2,
        tension: 0.3,
      }))
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(102, 126, 234, 0.1)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      }
    },
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Enhanced Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
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
                <Analytics sx={{ fontSize: 36 }} />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight={700}>
                  Enhanced GATE Trends
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.95 }}>
                  Year-wise & Topic-wise Analysis (2015-2024)
                </Typography>
              </Box>
            </Box>
            
            {/* Filter Controls */}
            <Box
              sx={{
                mt: 3,
                p: 3,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <ButtonGroup variant="contained" sx={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                <Button 
                  onClick={() => setViewMode('overview')}
                  sx={{ 
                    background: viewMode === 'overview' ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                    color: 'white',
                    '&:hover': { background: 'rgba(255, 255, 255, 0.2)' }
                  }}
                >
                  Overview
                </Button>
                <Button 
                  onClick={() => setViewMode('yearwise')}
                  sx={{ 
                    background: viewMode === 'yearwise' ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                    color: 'white',
                    '&:hover': { background: 'rgba(255, 255, 255, 0.2)' }
                  }}
                >
                  Year-wise
                </Button>
                <Button 
                  onClick={() => setViewMode('subject')}
                  sx={{ 
                    background: viewMode === 'subject' ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                    color: 'white',
                    '&:hover': { background: 'rgba(255, 255, 255, 0.2)' }
                  }}
                >
                  Subject-wise
                </Button>
              </ButtonGroup>
              
              {viewMode === 'subject' && (
                <FormControl sx={{ minWidth: 200 }}>
                  <Select
                    value={selectedSubject}
                    onChange={handleSubjectChange}
                    displayEmpty
                    sx={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      '& .MuiSelect-icon': { color: 'white' },
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    }}
                  >
                    <MenuItem value="">Select Subject</MenuItem>
                    {subjects.map(subject => (
                      <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <motion.div whileHover={{ scale: 1.05, y: -8 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Assessment sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight={800}>
                      {trendsData?.localData?.totalQuestions || 0}
                    </Typography>
                    <Typography variant="body2">Total Questions</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <motion.div whileHover={{ scale: 1.05, y: -8 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <DateRange sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight={800}>10</Typography>
                    <Typography variant="body2">Years Analyzed</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <motion.div whileHover={{ scale: 1.05, y: -8 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <School sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight={800}>
                      {Object.keys(trendsData?.localData?.subjectWiseBreakdown || {}).length}
                    </Typography>
                    <Typography variant="body2">Subjects</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <motion.div whileHover={{ scale: 1.05, y: -8 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(67, 233, 123, 0.3)',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <TrendingUp sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight={800}>
                      {trendsData?.topicFrequency?.length || 0}
                    </Typography>
                    <Typography variant="body2">Topics</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Main Content Based on View Mode */}
      {viewMode === 'overview' && (
        <Grid container spacing={3}>
          {/* Year-wise Overview */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>Year-wise Question Distribution</Typography>
                <Box sx={{ height: 400 }}>
                  <Line data={yearwiseOverviewData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Subject Distribution */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>Subject Distribution</Typography>
                <Box sx={{ height: 400 }}>
                  <Doughnut 
                    data={subjectDistributionData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 12,
                            font: { size: 10 }
                          }
                        }
                      }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {viewMode === 'yearwise' && yearwiseData && (
        <Grid container spacing={3}>
          {/* Yearly Statistics */}
          {Object.entries(yearwiseData.yearlyStats || {}).map(([year, stats]) => (
            <Grid item xs={12} key={year}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip label={year} color="primary" />
                    <Typography variant="h6">
                      {stats.totalQuestions} Questions
                    </Typography>
                    <Chip 
                      label={stats.mostFrequentSubject} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>Subject Distribution</Typography>
                      {Object.entries(stats.subjectDistribution || {}).map(([subject, count]) => (
                        <Box key={subject} display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">{subject}</Typography>
                          <Chip label={count} size="small" />
                        </Box>
                      ))}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>Difficulty Distribution</Typography>
                      {Object.entries(stats.difficultyDistribution || {}).map(([difficulty, count]) => (
                        <Box key={difficulty} display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {difficulty}
                          </Typography>
                          <Chip 
                            label={count} 
                            size="small" 
                            color={difficulty === 'hard' ? 'error' : difficulty === 'medium' ? 'warning' : 'success'}
                          />
                        </Box>
                      ))}
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}

      {viewMode === 'subject' && selectedSubject && subjectData && (
        <Grid container spacing={3}>
          {/* Subject Topic Trends */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  {selectedSubject} - Topic Trends Over Years
                </Typography>
                <Box sx={{ height: 400 }}>
                  {getSubjectTopicTrends() && (
                    <Line data={getSubjectTopicTrends()} options={chartOptions} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Subject Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>Subject Summary</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {subjectData.data?.subjectSummary?.totalQuestions || 0}
                      </Typography>
                      <Typography variant="body2">Total Questions</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="secondary">
                        {subjectData.data?.subjectSummary?.uniqueTopics || 0}
                      </Typography>
                      <Typography variant="body2">Unique Topics</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {subjectData.data?.subjectSummary?.averageDifficulty?.toFixed(1) || 0}
                      </Typography>
                      <Typography variant="body2">Avg Difficulty</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default EnhancedTrends;