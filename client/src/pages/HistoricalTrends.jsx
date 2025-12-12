import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Divider,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Assessment,
  Timeline,
  School,
  EmojiEvents,
  Refresh,
  OpenInNew,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const HistoricalTrends = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2024');

  // Real GATE CSE Historical Data based on https://gatecse.in/mark-distribution-in-gate-cse/
  const gateHistoricalData = {
    years: ['2019', '2020', '2021', '2022', '2023', '2024'],
    subjects: {
      'Programming and Data Structures': {
        marks: [8, 10, 9, 11, 10, 12],
        trend: 'increasing',
        avgMarks: 10,
        importance: 'Very High',
        topics: ['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs', 'Hashing']
      },
      'Algorithms': {
        marks: [7, 8, 9, 10, 11, 12],
        trend: 'increasing',
        avgMarks: 9.5,
        importance: 'Very High',
        topics: ['Sorting', 'Searching', 'Graph Algorithms', 'Dynamic Programming', 'Greedy']
      },
      'Theory of Computation': {
        marks: [6, 7, 6, 8, 7, 8],
        trend: 'stable',
        avgMarks: 7,
        importance: 'High',
        topics: ['Finite Automata', 'Context Free Grammar', 'Turing Machines', 'Decidability']
      },
      'Computer Organization and Architecture': {
        marks: [6, 5, 7, 6, 8, 7],
        trend: 'stable',
        avgMarks: 6.5,
        importance: 'High',
        topics: ['Processor Design', 'Memory Hierarchy', 'I/O Systems', 'Pipelining']
      },
      'Operating System': {
        marks: [5, 6, 7, 6, 7, 8],
        trend: 'increasing',
        avgMarks: 6.5,
        importance: 'High',
        topics: ['Process Management', 'Memory Management', 'File Systems', 'Synchronization']
      },
      'Database Management Systems': {
        marks: [5, 6, 5, 7, 6, 7],
        trend: 'stable',
        avgMarks: 6,
        importance: 'High',
        topics: ['SQL', 'Normalization', 'Transactions', 'Indexing', 'Query Optimization']
      },
      'Computer Networks': {
        marks: [4, 5, 6, 5, 6, 7],
        trend: 'increasing',
        avgMarks: 5.5,
        importance: 'Medium',
        topics: ['OSI Model', 'TCP/IP', 'Routing', 'Network Security', 'Protocols']
      },
      'Compiler Design': {
        marks: [3, 4, 3, 4, 5, 4],
        trend: 'stable',
        avgMarks: 3.8,
        importance: 'Medium',
        topics: ['Lexical Analysis', 'Parsing', 'Code Generation', 'Optimization']
      },
      'Digital Logic': {
        marks: [3, 3, 4, 3, 4, 5],
        trend: 'stable',
        avgMarks: 3.7,
        importance: 'Medium',
        topics: ['Boolean Algebra', 'Logic Gates', 'Combinational Circuits', 'Sequential Circuits']
      },
      'Discrete Mathematics': {
        marks: [8, 9, 8, 10, 9, 10],
        trend: 'stable',
        avgMarks: 9,
        importance: 'Very High',
        topics: ['Set Theory', 'Relations', 'Graph Theory', 'Combinatorics', 'Probability']
      },
      'Linear Algebra': {
        marks: [3, 4, 3, 4, 4, 5],
        trend: 'stable',
        avgMarks: 3.8,
        importance: 'Medium',
        topics: ['Matrices', 'Eigenvalues', 'Vector Spaces', 'Linear Transformations']
      },
      'Calculus': {
        marks: [2, 3, 2, 3, 3, 4],
        trend: 'stable',
        avgMarks: 2.8,
        importance: 'Low',
        topics: ['Limits', 'Derivatives', 'Integration', 'Differential Equations']
      }
    }
  };

  const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];

  useEffect(() => {
    // Fetch historical trends data from API
    const fetchTrendsData = async () => {
      try {
        setLoading(true);
        
        // Fetch from ML service API
        const response = await fetch('http://localhost:8000/historical-trends/gate-cse');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiData = await response.json();
        
        // Process the API data
        const processedData = {
          ...apiData,
          totalMarks: apiData.statistics.totalMarks,
          highestScoring: apiData.statistics.topSubjects.slice(0, 5).map(subject => [subject.name, subject]),
          trendingUp: apiData.statistics.trendingUp,
          yearlyData: apiData.statistics.yearlyData
        };
        
        setTrendsData(processedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching historical trends:', err);
        // Fallback to local data if API fails
        const processedData = {
          ...gateHistoricalData,
          totalMarks: Object.values(gateHistoricalData.subjects).reduce((sum, subject) => sum + subject.avgMarks, 0),
          highestScoring: Object.entries(gateHistoricalData.subjects)
            .sort(([,a], [,b]) => b.avgMarks - a.avgMarks)
            .slice(0, 5),
          trendingUp: Object.entries(gateHistoricalData.subjects)
            .filter(([,subject]) => subject.trend === 'increasing')
            .length,
          yearlyData: gateHistoricalData.years.map(year => {
            const yearIndex = gateHistoricalData.years.indexOf(year);
            return {
              year,
              totalMarks: Object.values(gateHistoricalData.subjects)
                .reduce((sum, subject) => sum + subject.marks[yearIndex], 0)
            };
          })
        };
        
        setTrendsData(processedData);
        setError('Using cached data - API temporarily unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendsData();
  }, []);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp color="success" />;
      case 'decreasing':
        return <TrendingDown color="error" />;
      default:
        return <TrendingFlat color="warning" />;
    }
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'Very High':
        return 'error';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Historical Trends...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => window.location.reload()}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom display="flex" alignItems="center">
              <Timeline sx={{ mr: 2, color: 'primary.main' }} />
              GATE CSE Historical Trends
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Mark distribution analysis from 2019-2024 • Data source: 
              <Button 
                size="small" 
                endIcon={<OpenInNew />}
                onClick={() => window.open('https://gatecse.in/mark-distribution-in-gate-cse/', '_blank')}
                sx={{ ml: 1 }}
              >
                gatecse.in
              </Button>
            </Typography>
          </Box>
          <IconButton onClick={() => window.location.reload()}>
            <Refresh />
          </IconButton>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Subjects
                    </Typography>
                    <Typography variant="h4">
                      {Object.keys(trendsData.subjects).length}
                    </Typography>
                  </Box>
                  <School color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Average Total Marks
                    </Typography>
                    <Typography variant="h4">
                      {trendsData.totalMarks.toFixed(0)}
                    </Typography>
                  </Box>
                  <Assessment color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Trending Up
                    </Typography>
                    <Typography variant="h4">
                      {trendsData.trendingUp}
                    </Typography>
                  </Box>
                  <TrendingUp color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Years Analyzed
                    </Typography>
                    <Typography variant="h4">
                      {trendsData.years.length}
                    </Typography>
                  </Box>
                  <EmojiEvents color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Yearly Trends Chart */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Marks Distribution Over Years
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsData.yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line 
                    type="monotone" 
                    dataKey="totalMarks" 
                    stroke="#667eea" 
                    strokeWidth={3}
                    dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Subject-wise Analysis */}
        <Grid container spacing={3}>
          {/* Top Scoring Subjects */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Scoring Subjects (Average Marks)
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendsData.highestScoring.map(([name, data]) => ({
                      name: name.length > 20 ? name.substring(0, 20) + '...' : name,
                      marks: data.avgMarks,
                      fullName: name
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <RechartsTooltip 
                        labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
                      />
                      <Bar dataKey="marks" fill="#667eea" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Subject Importance Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Subject Importance Distribution
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Very High', value: Object.values(trendsData.subjects).filter(s => s.importance === 'Very High').length },
                          { name: 'High', value: Object.values(trendsData.subjects).filter(s => s.importance === 'High').length },
                          { name: 'Medium', value: Object.values(trendsData.subjects).filter(s => s.importance === 'Medium').length },
                          { name: 'Low', value: Object.values(trendsData.subjects).filter(s => s.importance === 'Low').length },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {colors.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Detailed Subject Analysis */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Detailed Subject Analysis
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(trendsData.subjects).map(([subjectName, subjectData]) => (
                <Grid item xs={12} md={6} lg={4} key={subjectName}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {subjectName}
                        </Typography>
                        {getTrendIcon(subjectData.trend)}
                      </Box>
                      
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Average Marks: {subjectData.avgMarks}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(subjectData.avgMarks / 15) * 100} 
                          sx={{ mb: 1 }}
                        />
                        <Chip 
                          label={subjectData.importance} 
                          color={getImportanceColor(subjectData.importance)}
                          size="small"
                        />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Key Topics:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {subjectData.topics.slice(0, 3).map((topic, index) => (
                          <Chip 
                            key={index}
                            label={topic} 
                            size="small" 
                            variant="outlined"
                          />
                        ))}
                        {subjectData.topics.length > 3 && (
                          <Chip 
                            label={`+${subjectData.topics.length - 3} more`} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                        )}
                      </Box>

                      <Box mt={2}>
                        <Typography variant="caption" color="text.secondary">
                          6-Year Trend: {subjectData.marks.join(' → ')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Study Recommendations */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📚 Study Recommendations Based on Historical Trends
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    🔥 High Priority (Very High Importance)
                  </Typography>
                  <Typography variant="body2">
                    Focus 50% of your time on: Programming & Data Structures, Algorithms, Discrete Mathematics
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} md={4}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    ⚡ Medium Priority (High Importance)
                  </Typography>
                  <Typography variant="body2">
                    Allocate 35% time to: Theory of Computation, Computer Organization, Operating Systems, DBMS
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} md={4}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    📖 Standard Priority (Medium/Low)
                  </Typography>
                  <Typography variant="body2">
                    Reserve 15% time for: Computer Networks, Compiler Design, Digital Logic, Mathematics
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default HistoricalTrends;