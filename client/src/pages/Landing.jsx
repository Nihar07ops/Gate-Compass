import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EmojiEvents,
  School,
  TrendingUp,
  Psychology,
  ArrowForward,
  Star,
} from '@mui/icons-material';

const Landing = () => {
  const [gateOpening, setGateOpening] = useState(false);
  const [motivationalQuote] = useState(() => {
    const quotes = [
      "The path from dreams to reality does exist.",
      "Hard work beats talent when talent doesn't work hard.",
      "Success is the sum of small efforts, repeated day in and day out.",
      "Study while others are sleeping; work while others are loafing; prepare while others are playing, and dream while others are wishing.",
      "Your only limit is you.",
      "Dream it. Believe it. Achieve it.",
      "The expert in anything was once a beginner.",
      "Success doesn't come from what you do occasionally, it comes from what you do consistently.",
      "Don't stop when you're tired. Stop when you're done.",
      "The future belongs to those who believe in the beauty of their dreams.",
      "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
      "The only way to do great work is to love what you do.",
      "Believe you can and you're halfway there.",
      "Your dedication today determines your success tomorrow.",
      "Every accomplishment starts with the decision to try.",
      "The harder you work for something, the greater you'll feel when you achieve it.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "Don't watch the clock; do what it does. Keep going.",
      "The secret of getting ahead is getting started.",
      "It always seems impossible until it's done.",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  });
  const [buttonText] = useState(() => {
    const texts = [
      "Step into the GATE",
      "Begin the GATE challenge",
      "Unlock the GATE opportunity",
      "Embrace the GATE path",
      "Start your GATE quest",
      "Open the door to GATE success",
      "Launch your GATE journey",
    ];
    return texts[Math.floor(Math.random() * texts.length)];
  });
  const navigate = useNavigate();

  const handleEnter = () => {
    setGateOpening(true);
    setTimeout(() => {
      navigate('/login');
    }, 3500); // Increased to 3.5 seconds to give time to read the quote
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
        }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.5, 1],
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: 'white',
            }}
          />
        ))}
      </Box>

      <AnimatePresence>
        {!gateOpening ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Container maxWidth="lg">
              <Box
                sx={{
                  minHeight: '100vh',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {/* Floating Trophy Icon */}
                <motion.div
                  initial={{ y: -100, opacity: 0, scale: 0 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 100,
                    damping: 10,
                    delay: 0.2,
                  }}
                >
                  <motion.div
                    animate={{
                      y: [-10, 10, -10],
                      rotate: [-5, 5, -5],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Box
                      sx={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '50%',
                        p: 4,
                        mb: 4,
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      <EmojiEvents
                        sx={{
                          fontSize: 120,
                          color: '#ffd700',
                          filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))',
                        }}
                      />
                    </Box>
                  </motion.div>
                </motion.div>

                {/* Main Title */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '3rem', md: '5rem' },
                      fontWeight: 900,
                      color: 'white',
                      textAlign: 'center',
                      mb: 2,
                      textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                      letterSpacing: '-2px',
                    }}
                  >
                    GATE Compass
                  </Typography>
                </motion.div>

                {/* Subtitle */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      fontWeight: 300,
                      color: 'rgba(255, 255, 255, 0.95)',
                      textAlign: 'center',
                      mb: 1,
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    Your Path to Victory
                  </Typography>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.2rem' },
                      fontWeight: 400,
                      color: 'rgba(255, 255, 255, 0.85)',
                      textAlign: 'center',
                      mb: 6,
                      maxWidth: '600px',
                    }}
                  >
                    AI-Powered GATE CSE Preparation Platform
                  </Typography>
                </motion.div>

                {/* Feature Icons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 4,
                      mb: 6,
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                    }}
                  >
                    {[
                      { icon: School, label: 'Smart Learning' },
                      { icon: Psychology, label: 'AI Predictions' },
                      { icon: TrendingUp, label: 'Track Progress' },
                      { icon: Star, label: 'Top Resources' },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 1.2 + index * 0.1,
                          type: 'spring',
                          stiffness: 200,
                        }}
                        whileHover={{ scale: 1.1, y: -5 }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 3,
                            p: 2,
                            minWidth: 120,
                          }}
                        >
                          <item.icon sx={{ fontSize: 40, color: 'white' }} />
                          <Typography
                            variant="body2"
                            sx={{ color: 'white', fontWeight: 600 }}
                          >
                            {item.label}
                          </Typography>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>
                </motion.div>

                {/* Enter Button */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 1.6,
                    type: 'spring',
                    stiffness: 200,
                  }}
                  whileHover={{ 
                    scale: 1.05,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                    }}
                  >
                    {/* Animated glow ring */}
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{
                        position: 'absolute',
                        top: -4,
                        left: -4,
                        right: -4,
                        bottom: -4,
                        borderRadius: '50px',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(102,126,234,0.4))',
                        filter: 'blur(8px)',
                        zIndex: 0,
                      }}
                    />
                    
                    <Button
                      variant="contained"
                      endIcon={<ArrowForward sx={{ fontSize: '1rem' }} />}
                      onClick={handleEnter}
                      sx={{
                        position: 'relative',
                        zIndex: 1,
                        fontSize: { xs: '0.95rem', md: '1rem' },
                        fontWeight: 600,
                        px: { xs: 3.5, md: 4 },
                        py: { xs: 1.2, md: 1.3 },
                        borderRadius: '50px',
                        background: 'linear-gradient(135deg, #c2bcbcff 0%, #f8f8f8 100%)',
                        color: '#667eea',
                        boxShadow: '0 8px 32px rgba(255, 255, 255, 0.3), inset 0 1px 0 rgba(255,255,255,0.8)',
                        textTransform: 'none',
                        letterSpacing: '0.3px',
                        border: '2px solid rgba(255, 255, 255, 0.5)',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(102,126,234,0.2), transparent)',
                          transition: 'left 0.6s ease',
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '0',
                          height: '0',
                          borderRadius: '50%',
                          background: 'rgba(102, 126, 234, 0.1)',
                          transform: 'translate(-50%, -50%)',
                          transition: 'width 0.6s, height 0.6s',
                        },
                        '&:hover': {
                          background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                          boxShadow: '0 12px 40px rgba(255, 255, 255, 0.4), 0 0 0 4px rgba(102, 126, 234, 0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
                          transform: 'translateY(-2px)',
                          borderColor: 'rgba(102, 126, 234, 0.3)',
                        },
                        '&:hover::before': {
                          left: '100%',
                        },
                        '&:hover::after': {
                          width: '300px',
                          height: '300px',
                        },
                      }}
                    >
                      {buttonText}
                    </Button>
                  </Box>
                </motion.div>
              </Box>
            </Container>
          </motion.div>
        ) : (
          // Gate Opening Animation
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
            }}
          >
            {/* Left Gate Door */}
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: '-100%' }}
              transition={{ duration: 1.2, ease: [0.6, 0.05, 0.01, 0.9] }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '50%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '10px 0 50px rgba(0, 0, 0, 0.5)',
                zIndex: 10,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  right: 20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 60,
                  height: 200,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                }}
              />
            </motion.div>

            {/* Right Gate Door */}
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.2, ease: [0.6, 0.05, 0.01, 0.9] }}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '50%',
                background: 'linear-gradient(90deg, #764ba2 0%, #667eea 100%)',
                boxShadow: '-10px 0 50px rgba(0, 0, 0, 0.5)',
                zIndex: 10,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: 20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 60,
                  height: 200,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                }}
              />
            </motion.div>

            {/* Center Light Burst */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 3, opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                width: 200,
                height: 200,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 70%)',
                zIndex: 5,
              }}
            />

            {/* Motivational Quote */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{ 
                position: 'relative', 
                zIndex: 1,
                maxWidth: '90%',
                textAlign: 'center',
                padding: '0 20px',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  textShadow: '0 0 30px rgba(255, 255, 255, 0.8)',
                  fontSize: { xs: '1.5rem', md: '2.5rem' },
                  lineHeight: 1.4,
                  fontStyle: 'italic',
                }}
              >
                "{motivationalQuote}"
              </Typography>
            </motion.div>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Landing;
