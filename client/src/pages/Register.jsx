import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Chip,
} from '@mui/material';
import { 
  Person, 
  Email, 
  Lock, 
  Visibility, 
  VisibilityOff, 
  School,
  EmojiEvents,
  TrendingUp,
  AutoGraph,
  MenuBook,
  Rocket,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated floating GATE icons */}
      {[
        { Icon: School, delay: 0, x: '10%', y: '20%' },
        { Icon: EmojiEvents, delay: 0.5, x: '80%', y: '15%' },
        { Icon: TrendingUp, delay: 1, x: '15%', y: '70%' },
        { Icon: AutoGraph, delay: 1.5, x: '85%', y: '75%' },
        { Icon: MenuBook, delay: 2, x: '50%', y: '10%' },
        { Icon: Rocket, delay: 2.5, x: '90%', y: '50%' },
      ].map(({ Icon, delay, x, y }, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            opacity: 0.1,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon sx={{ fontSize: 60, color: '#ffffff' }} />
        </motion.div>
      ))}

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Paper 
            elevation={20} 
            sx={{ 
              p: 4, 
              borderRadius: 4,
              backgroundColor: '#000000ff',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              }
            }}
          >
            <Box textAlign="center" mb={3}>
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Rocket sx={{ fontSize: 70, color: '#667eea', mb: 1 }} />
              </motion.div>
              <Typography 
                variant="h3" 
                fontWeight={800} 
                gutterBottom 
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.5px',
                }}
              >
                GATE CSE Prep
              </Typography>
              <Typography variant="h6" sx={{ color: '#764ba2', fontWeight: 600, mb: 2 }}>
                Start Your Journey!
              </Typography>
              
              {/* Feature chips */}
              <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap" mb={2}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Chip 
                    icon={<School sx={{ color: '#667eea !important' }} />}
                    label="50+ Questions" 
                    size="small"
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                      border: '1px solid #667eea30',
                      fontWeight: 600,
                    }}
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Chip 
                    icon={<AutoGraph sx={{ color: '#764ba2 !important' }} />}
                    label="AI Powered" 
                    size="small"
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                      border: '1px solid #764ba230',
                      fontWeight: 600,
                    }}
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Chip 
                    icon={<MenuBook sx={{ color: '#667eea !important' }} />}
                    label="Study Resources" 
                    size="small"
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                      border: '1px solid #667eea30',
                      fontWeight: 600,
                    }}
                  />
                </motion.div>
              </Box>
            </Box>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              </motion.div>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <TextField
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#764ba2',
                      },
                    },
                  }}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#764ba2',
                      },
                    },
                  }}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#764ba2',
                      },
                    },
                  }}
                />
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Rocket />}
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      boxShadow: '0 6px 20px rgba(118, 75, 162, 0.4)',
                    }
                  }}
                >
                  Start Learning Now
                </Button>
              </motion.div>
              
              <Box textAlign="center">
                <Typography variant="body2" sx={{ color: '#667eea', fontWeight: 500 }}>
                  Already have an account?{' '}
                  <Link 
                    component={RouterLink} 
                    to="/login"
                    sx={{ 
                      fontWeight: 700,
                      color: '#764ba2',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: '#667eea',
                      }
                    }}
                  >
                    Login here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Register;
