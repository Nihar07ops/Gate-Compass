import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress } from '@mui/material';
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
} from 'chart.js';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

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

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  const topicFrequencyData = {
    labels: trendsData?.topicFrequency?.map(t => t.topic) || [],
    datasets: [{
      label: 'Question Frequency',
      data: trendsData?.topicFrequency?.map(t => t.count) || [],
      backgroundColor: 'rgba(25, 118, 210, 0.6)',
    }]
  };

  const difficultyTrendData = {
    labels: trendsData?.years || [],
    datasets: [{
      label: 'Average Difficulty',
      data: trendsData?.difficultyTrend || [],
      borderColor: 'rgb(220, 0, 78)',
      backgroundColor: 'rgba(220, 0, 78, 0.1)',
      tension: 0.4
    }]
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Historical Trends Analysis</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Topic Frequency (Last 10 Years)</Typography>
              <Bar data={topicFrequencyData} options={{ responsive: true }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Difficulty Trend Over Years</Typography>
              <Line data={difficultyTrendData} options={{ responsive: true }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HistoricalTrends;
