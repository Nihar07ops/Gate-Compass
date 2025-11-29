import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress } from '@mui/material';
import { Radar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement } from 'chart.js';
import api from '../utils/api';

ChartJS.register(ArcElement);

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

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  const performanceData = {
    labels: analytics?.topicPerformance?.map(t => t.topic) || [],
    datasets: [{
      label: 'Performance Score',
      data: analytics?.topicPerformance?.map(t => t.score) || [],
      backgroundColor: 'rgba(25, 118, 210, 0.2)',
      borderColor: 'rgba(25, 118, 210, 1)',
      borderWidth: 2,
    }]
  };

  const accuracyData = {
    labels: ['Correct', 'Incorrect', 'Unattempted'],
    datasets: [{
      data: [analytics?.correct || 0, analytics?.incorrect || 0, analytics?.unattempted || 0],
      backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
    }]
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Performance Analytics</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Topic-wise Performance</Typography>
              <Radar data={performanceData} options={{ responsive: true }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Overall Accuracy</Typography>
              <Doughnut data={accuracyData} options={{ responsive: true }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
