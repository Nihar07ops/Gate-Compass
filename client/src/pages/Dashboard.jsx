import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, LinearProgress, Button, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Psychology, Quiz, EmojiEvents, 
  AutoGraph, School, Timer, Star 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    testsCompleted: 0,
    averageScore: 0,
    strongTopics: [],
    weakTopics: [],
    streak: 0
  });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    fetchDashboardData();
    setGreetingMessage();
  }, []);

  const setGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  };

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
    { 
      title: 'Tests Completed', 
      value: stats.testsCompleted, 
      icon: <Quiz />, 
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      subtitle: 'Keep going!'
    },
    { 
      title: 'Average Score', 
      value: `${stats.averageScore}%`, 
      icon: <TrendingUp />, 
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      subtitle: 'Great progress'
    },
    { 
      title: 'Study Streak', 
      value: `${stats.streak}`, 
      icon: <EmojiEvents />, 
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      subtitle: 'days in a row'
    },
    { 
      title: 'Topics Mastered', 
      value: stats.strongTopics.length, 
      icon: <Psychology />, 
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      subtitle: 'Excellent!'
    },
  ];

  const quickActions = [
    { label: 'Start Mock Test', icon: <Quiz />, path: '/dashboard/mock-test', color: '#667eea' },
    { label: 'View Analytics', icon: <AutoGraph />, path: '/dashboard/analytics', color: '#f5576c' },
    { label: 'Topic Predictions', icon: <Psychology />, path: '/dashboard/predictions', color: '#00f2fe' },
    { label: 'Study Trends', icon: <School />, path: '/dashboard/trends', color: '#38f9d7' },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Psychology sx={{ fontSize: 64, color: '#667eea' }} />
        </motion.div>
      </Box>
    );
  }

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box mb={4}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            {greeting}! 👋
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Ready to ace your GATE CSE preparation today?
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={3} mb={4}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card 
                sx={{ 
                  background: card.gradient,
                  color: 'white',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Box sx={{ fontSize: 48, opacity: 0.9 }}>{card.icon}</Box>
                    </motion.div>
                  </Box>
                  <Typography variant="h3" fontWeight={700} mb={1}>
                    {card.value}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {card.title}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {card.subtitle}
                  </Typography>
                </CardContent>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }}
                />
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card sx={{ mb: 4, p: 2 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} mt={1}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={action.icon}
                      onClick={() => navigate(action.path)}
                      sx={{
                        background: action.color,
                        py: 2,
                        '&:hover': {
                          background: action.color,
                          filter: 'brightness(1.1)',
                        }
                      }}
                    >
                      {action.label}
                    </Button>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Star sx={{ color: '#ffd700', mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Strong Topics
                  </Typography>
                </Box>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {stats.strongTopics.length > 0 ? (
                    stats.strongTopics.map((topic, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <Chip 
                          label={topic} 
                          color="success" 
                          icon={<Star />}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      Complete tests to see your strong topics
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Timer sx={{ color: '#ff9800', mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Focus Areas
                  </Typography>
                </Box>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {stats.weakTopics.length > 0 ? (
                    stats.weakTopics.map((topic, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <Chip 
                          label={topic} 
                          color="warning"
                          icon={<Timer />}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      Complete tests to identify focus areas
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
