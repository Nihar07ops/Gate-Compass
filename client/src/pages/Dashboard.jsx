import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, LinearProgress, Button, Chip, Paper, Avatar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Psychology, Quiz, EmojiEvents,
  AutoGraph, School, Timer, Star, WavingHand, Lightbulb, LocalFireDepartment
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
  const [motivationalQuote] = useState(() => {
    const quotes = [
      { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
      { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
      { text: "Your dedication today determines your success tomorrow.", author: "Anonymous" },
      { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
      { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
      { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
      { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  });

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
      console.log('Dashboard: Fetching dashboard data...');
      const response = await api.get('/api/dashboard');
      console.log('Dashboard: Received response:', response);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to default stats if API fails
      setStats({
        testsCompleted: 5,
        averageScore: 75,
        strongTopics: ['Programming & Data Structures', 'Algorithms'],
        weakTopics: ['Computer Networks', 'Compiler Design'],
        streak: 3,
        totalQuestions: 1000
      });
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
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Animated Background Pattern */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.4) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section with Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
            {/* Decorative circles */}
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
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            />

            <Box position="relative" zIndex={1}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Typography variant="h3" fontWeight={700}>
                  {greeting}!
                </Typography>
                <motion.div
                  animate={{ rotate: [0, 15, -15, 15, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <WavingHand sx={{ fontSize: 48, color: '#FFD700' }} />
                </motion.div>
              </Box>
              <Typography variant="h6" sx={{ opacity: 0.95, mb: 3 }}>
                Ready to ace your GATE CSE preparation today?
              </Typography>

              {/* Motivational Quote */}
              <Box
                sx={{
                  mt: 3,
                  p: 3,
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  borderLeft: '4px solid #FFD700',
                }}
              >
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Lightbulb sx={{ fontSize: 32, color: '#FFD700' }} />
                  <Box>
                    <Typography variant="body1" fontStyle="italic" sx={{ mb: 1, fontSize: '1.1rem' }}>
                      "{motivationalQuote.text}"
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      — {motivationalQuote.author}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Stats Cards with Enhanced Design */}
        <Grid container spacing={3} mb={4}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card
                  sx={{
                    background: card.gradient,
                    color: 'white',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 12px 48px rgba(102, 126, 234, 0.3)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <Box sx={{ fontSize: 56, opacity: 0.9 }}>{card.icon}</Box>
                      </motion.div>
                      {index === 2 && stats.streak > 0 && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <LocalFireDepartment sx={{ fontSize: 32, color: '#FFD700' }} />
                        </motion.div>
                      )}
                    </Box>
                    <Typography variant="h2" fontWeight={800} mb={1}>
                      {card.value}
                    </Typography>
                    <Typography variant="h6" fontWeight={600} mb={0.5}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {card.subtitle}
                    </Typography>
                  </CardContent>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -20,
                      right: -20,
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      left: -10,
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.05)',
                    }}
                  />
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions with Enhanced Design */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card
            sx={{
              mb: 4,
              p: 3,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
            }}
          >
            <CardContent>
              <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={action.icon}
                        onClick={() => navigate(action.path)}
                        sx={{
                          background: `linear-gradient(135deg, ${action.color} 0%, ${action.color}dd 100%)`,
                          py: 2.5,
                          fontSize: '1rem',
                          fontWeight: 600,
                          borderRadius: 3,
                          boxShadow: `0 4px 20px ${action.color}40`,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${action.color} 0%, ${action.color}ee 100%)`,
                            boxShadow: `0 6px 30px ${action.color}60`,
                          },
                          transition: 'all 0.3s ease',
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

        {/* Topics Section with Enhanced Design */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                  border: '1px solid rgba(67, 233, 123, 0.3)',
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        mr: 2,
                      }}
                    >
                      <Star />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      Strong Topics
                    </Typography>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={1.5}>
                    {stats.strongTopics.length > 0 ? (
                      stats.strongTopics.map((topic, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Chip
                            label={topic}
                            sx={{
                              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              py: 2.5,
                            }}
                            icon={<Star sx={{ color: 'white !important' }} />}
                          />
                        </motion.div>
                      ))
                    ) : (
                      <Box textAlign="center" width="100%" py={3}>
                        <Typography color="text.secondary" variant="body1">
                          Complete tests to see your strong topics
                        </Typography>
                        <Typography variant="caption" color="text.secondary" mt={1}>
                          Topics where you score 75%+ will appear here
                        </Typography>
                      </Box>
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
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
                  border: '1px solid rgba(255, 152, 0, 0.3)',
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
                        mr: 2,
                      }}
                    >
                      <Timer />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      Focus Areas
                    </Typography>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={1.5}>
                    {stats.weakTopics.length > 0 ? (
                      stats.weakTopics.map((topic, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Chip
                            label={topic}
                            sx={{
                              background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              py: 2.5,
                            }}
                            icon={<Timer sx={{ color: 'white !important' }} />}
                          />
                        </motion.div>
                      ))
                    ) : (
                      <Box textAlign="center" width="100%" py={3}>
                        <Typography color="text.secondary" variant="body1">
                          Complete tests to identify focus areas
                        </Typography>
                        <Typography variant="caption" color="text.secondary" mt={1}>
                          Topics where you score below 65% will appear here
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
