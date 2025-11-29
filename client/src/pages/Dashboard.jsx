import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { TrendingUp, Psychology, Quiz, EmojiEvents } from '@mui/icons-material';
import api from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    testsCompleted: 0,
    averageScore: 0,
    strongTopics: [],
    weakTopics: [],
    streak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Tests Completed', value: stats.testsCompleted, icon: <Quiz />, color: '#1976d2' },
    { title: 'Average Score', value: `${stats.averageScore}%`, icon: <TrendingUp />, color: '#2e7d32' },
    { title: 'Study Streak', value: `${stats.streak} days`, icon: <EmojiEvents />, color: '#ed6c02' },
    { title: 'Topics Mastered', value: stats.strongTopics.length, icon: <Psychology />, color: '#9c27b0' },
  ];

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome Back!
      </Typography>
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card sx={{ bgcolor: card.color, color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4">{card.value}</Typography>
                      <Typography variant="body2">{card.title}</Typography>
                    </Box>
                    <Box sx={{ fontSize: 48, opacity: 0.8 }}>{card.icon}</Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
