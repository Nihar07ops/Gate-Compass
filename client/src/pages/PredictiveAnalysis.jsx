import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Chip } from '@mui/material';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../utils/api';
import { motion } from 'framer-motion';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const PredictiveAnalysis = () => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await api.get('/api/predict');
      setPredictions(response.data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  const radarData = {
    labels: predictions?.topicImportance?.map(t => t.topic) || [],
    datasets: [{
      label: 'Predicted Importance',
      data: predictions?.topicImportance?.map(t => t.score) || [],
      backgroundColor: 'rgba(25, 118, 210, 0.2)',
      borderColor: 'rgba(25, 118, 210, 1)',
      borderWidth: 2,
    }]
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Predictive Topic Analysis</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Topic Importance Radar</Typography>
              <Radar data={radarData} options={{ responsive: true }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>High Priority Topics</Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                {predictions?.highPriorityTopics?.map((topic, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Chip label={topic} color="primary" />
                  </motion.div>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PredictiveAnalysis;
