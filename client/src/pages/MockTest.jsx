import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  ButtonGroup,
  Stack,
} from '@mui/material';
import {
  Timer,
  TimerOff,
  School,
  CheckCircle,
  Cancel,
  NavigateNext,
  NavigateBefore,
  Flag,
  Assessment,
  EmojiEvents,
  Speed,
  AccessTime,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const MockTest = () => {
  const [mode, setMode] = useState(null); // 'timed' or 'freestyle'
  const [format, setFormat] = useState(null); // 'gate' or 'custom'
  const [difficulty, setDifficulty] = useState(null); // 'beginner', 'intermediate', 'advanced'
  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Timer effect
  useEffect(() => {
    if (mode === 'timed' && timeRemaining > 0 && test && !showResults) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, timeRemaining, test, showResults]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateTest = async (testFormat, testMode, testDifficulty) => {
    setLoading(true);
    try {
      const response = await api.post('/api/generate-test', {
        format: testFormat,
        difficulty: testDifficulty,
        topicCount: testFormat === 'gate' ? 65 : 20
      });
      setTest(response.data);
      setAnswers({});
      setFlagged(new Set());
      setCurrentQuestion(0);
      setFormat(testFormat);
      setMode(testMode);
      setDifficulty(testDifficulty);
      
      // Set time based on difficulty
      if (testMode === 'timed') {
        const timeMap = {
          'beginner': 1800,      // 30 min
          'intermediate': 2700,  // 45 min
          'advanced': 3600       // 60 min
        };
        setTimeRemaining(timeMap[testDifficulty] || 3600);
      }
    } catch (error) {
      console.error('Error generating test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const toggleFlag = (questionId) => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(questionId)) {
      newFlagged.delete(questionId);
    } else {
      newFlagged.add(questionId);
    }
    setFlagged(newFlagged);
  };

  const submitTest = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/submit-test', {
        testId: test._id,
        answers
      });
      setResults(response.data);
      setShowResults(true);
      setShowSubmitConfirm(false);
    } catch (error) {
      console.error('Error submitting test:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionStatus = (questionId) => {
    if (answers[questionId]) return 'answered';
    if (flagged.has(questionId)) return 'flagged';
    return 'unanswered';
  };

  const getSectionInfo = () => {
    if (!test?.metadata?.sections) return null;
    const sections = test.metadata.sections;
    return [
      { name: 'General Aptitude', count: sections['General Aptitude'] || 0, start: 0 },
      { name: 'Engineering Mathematics', count: sections['Engineering Mathematics'] || 0, start: sections['General Aptitude'] || 0 },
      { name: 'Core Computer Science', count: sections['Core Computer Science'] || 0, start: (sections['General Aptitude'] || 0) + (sections['Engineering Mathematics'] || 0) }
    ];
  };

  // Mode Selection Screen
  if (!mode || !format || !difficulty) {
    return (
      <Box>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Box textAlign="center" mb={4}>
            <School sx={{ fontSize: 80, color: '#667eea', mb: 2 }} />
            <Typography variant="h3" fontWeight={700} gutterBottom sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              GATE CSE Mock Tests
            </Typography>
            <Typography variant="h6" color="text.secondary" mb={3}>
              Choose your difficulty level and test mode
            </Typography>
            
            {/* Difficulty Selection */}
            <Paper elevation={3} sx={{ p: 3, mb: 4, maxWidth: 800, mx: 'auto', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' }}>
              <Typography variant="h5" fontWeight={600} gutterBottom textAlign="center" mb={3}>
                Select Difficulty Level
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: difficulty === 'beginner' ? '3px solid #43e97b' : '2px solid #43e97b30',
                        background: difficulty === 'beginner' ? 'linear-gradient(135deg, #43e97b15 0%, #38f9d715 100%)' : 'transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          border: '3px solid #43e97b',
                          boxShadow: '0 4px 20px rgba(67, 233, 123, 0.3)',
                        }
                      }}
                      onClick={() => setDifficulty('beginner')}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="h5" fontWeight={700} color="#43e97b" gutterBottom>
                          📘 Beginner
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          Foundation Building
                        </Typography>
                        <Chip label="20 Questions" size="small" sx={{ mb: 0.5 }} />
                        <Typography variant="caption" display="block">30 minutes</Typography>
                        <Typography variant="caption" display="block">1 mark each</Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
                <Grid item xs={12} md={4}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: difficulty === 'intermediate' ? '3px solid #4facfe' : '2px solid #4facfe30',
                        background: difficulty === 'intermediate' ? 'linear-gradient(135deg, #4facfe15 0%, #00f2fe15 100%)' : 'transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          border: '3px solid #4facfe',
                          boxShadow: '0 4px 20px rgba(79, 172, 254, 0.3)',
                        }
                      }}
                      onClick={() => setDifficulty('intermediate')}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="h5" fontWeight={700} color="#4facfe" gutterBottom>
                          📙 Intermediate
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          Concept Application
                        </Typography>
                        <Chip label="20 Questions" size="small" sx={{ mb: 0.5 }} />
                        <Typography variant="caption" display="block">45 minutes</Typography>
                        <Typography variant="caption" display="block">2 marks each</Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
                <Grid item xs={12} md={4}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: difficulty === 'advanced' ? '3px solid #f093fb' : '2px solid #f093fb30',
                        background: difficulty === 'advanced' ? 'linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%)' : 'transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          border: '3px solid #f093fb',
                          boxShadow: '0 4px 20px rgba(240, 147, 251, 0.3)',
                        }
                      }}
                      onClick={() => setDifficulty('advanced')}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="h5" fontWeight={700} color="#f093fb" gutterBottom>
                          📕 Advanced
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          GATE Level
                        </Typography>
                        <Chip label="15 Questions" size="small" sx={{ mb: 0.5 }} />
                        <Typography variant="caption" display="block">60 minutes</Typography>
                        <Typography variant="caption" display="block">3 marks each</Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>
              {difficulty && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      <strong>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level Selected:</strong> {
                        difficulty === 'beginner' ? 'Perfect for building foundation with basic concepts and definitions.' :
                        difficulty === 'intermediate' ? 'Ideal for applying concepts with moderate problem-solving.' :
                        'Challenging GATE-level questions for serious preparation.'
                      }
                    </Typography>
                  </Alert>
                </motion.div>
              )}
            </Paper>
          </Box>

          <Grid container spacing={3} maxWidth="lg" mx="auto">
            {/* GATE Format - Timed */}
            <Grid item xs={12} md={6}>
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                    border: '2px solid #667eea30',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: '2px solid #667eea',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    }
                  }}
                  onClick={() => generateTest('gate', 'timed')}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box display="flex" justifyContent="center" mb={2}>
                      <Timer sx={{ fontSize: 60, color: '#667eea' }} />
                    </Box>
                    <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
                      GATE Format
                    </Typography>
                    <Typography variant="h6" textAlign="center" color="primary" gutterBottom>
                      AceTimer Test
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircle sx={{ color: '#667eea', fontSize: 20 }} />
                        <Typography>65 Questions</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircle sx={{ color: '#667eea', fontSize: 20 }} />
                        <Typography>180 Minutes (3 Hours)</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircle sx={{ color: '#667eea', fontSize: 20 }} />
                        <Typography>3 Sections (GA, EM, CS)</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircle sx={{ color: '#667eea', fontSize: 20 }} />
                        <Typography>100 Marks Total</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircle sx={{ color: '#667eea', fontSize: 20 }} />
                        <Typography>Auto-submit on timeout</Typography>
                      </Box>
                    </Stack>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{ 
                        mt: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        py: 1.5,
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Generating...' : 'Start AceTimer Test'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* GATE Format - Freestyle */}
            <Grid item xs={12} md={6}>
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #764ba215 0%, #667eea15 100%)',
                    border: '2px solid #764ba230',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: '2px solid #764ba2',
                      boxShadow: '0 8px 32px rgba(118, 75, 162, 0.3)',
                    }
                  }}
                  onClick={() => generateTest('gate', 'freestyle')}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box display="flex" justifyContent="center" mb={2}>
                      <TimerOff sx={{ fontSize: 60, color: '#764ba2' }} />
                    </Box>
                    <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
                      GATE Format
                    </Typography>
                    <Typography variant="h6" textAlign="center" color="secondary" gutterBottom>
                      Freestyle Mode
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircle sx={{ color: '#764ba2', fontSize: 20 }} />
                        <Typography>65 Questions</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircle sx={{ color: '#764ba2', fontSize: 20 }} />
                        <Typography>No Time Limit</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircle sx={{ color: '#764ba2', fontSize: 20 }} />
                        <Typography>3 Sections (GA, EM, CS)</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircle sx={{ color: '#764ba2', fontSize: 20 }} />
                        <Typography>Practice at your pace</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircle sx={{ color: '#764ba2', fontSize: 20 }} />
                        <Typography>Review anytime</Typography>
                      </Box>
                    </Stack>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{ 
                        mt: 3,
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        py: 1.5,
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Generating...' : 'Start Freestyle Test'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Box>
    );
  }

  // Test Interface
  if (!test || !test.questions || test.questions.length === 0) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography>Loading test...</Typography>
      </Box>
    );
  }

  const question = test.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;
  const answered = Object.keys(answers).length;
  const unanswered = test.questions.length - answered;
  const sections = getSectionInfo();

  return (
    <Box>
      {/* Header with Timer and Stats */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <School sx={{ color: '#667eea' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Format</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {format === 'gate' ? 'GATE CSE' : 'Custom'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          {mode === 'timed' && (
            <Grid item xs={12} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <AccessTime sx={{ color: timeRemaining < 600 ? '#f44336' : '#667eea' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Time Remaining</Typography>
                  <Typography 
                    variant="h6" 
                    fontWeight={700}
                    color={timeRemaining < 600 ? 'error' : 'primary'}
                  >
                    {formatTime(timeRemaining)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
          
          <Grid item xs={12} md={mode === 'timed' ? 3 : 4}>
            <Box display="flex" alignItems="center" gap={1}>
              <Assessment sx={{ color: '#667eea' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Progress</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {answered}/{test.questions.length} Answered
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={mode === 'timed' ? 3 : 5}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setShowSubmitConfirm(true)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Submit Test
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Progress Bar */}
      <Box mb={3}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 4,
            }
          }} 
        />
        <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
          Question {currentQuestion + 1} of {test.questions.length}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Question Panel */}
        <Grid item xs={12} md={9}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
                    <Box>
                      <Chip 
                        label={question.section || question.subject} 
                        size="small"
                        sx={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          fontWeight: 600,
                          mb: 1
                        }}
                      />
                      <Typography variant="h6" fontWeight={600}>
                        Question {currentQuestion + 1}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Chip 
                        label={`${question.marks || 1} Mark${question.marks > 1 ? 's' : ''}`}
                        color="primary"
                        size="small"
                      />
                      <Tooltip title={flagged.has(question._id) ? "Remove flag" : "Flag for review"}>
                        <IconButton 
                          onClick={() => toggleFlag(question._id)}
                          color={flagged.has(question._id) ? "warning" : "default"}
                        >
                          <Flag />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 3, lineHeight: 1.8 }}>
                    {question.text}
                  </Typography>

                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={answers[question._id] || ''}
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                    >
                      {question.options.map((option, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.01, x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Paper
                            elevation={answers[question._id] === option ? 3 : 1}
                            sx={{
                              p: 2,
                              mb: 2,
                              cursor: 'pointer',
                              border: answers[question._id] === option 
                                ? '2px solid #667eea' 
                                : '2px solid transparent',
                              background: answers[question._id] === option
                                ? 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)'
                                : 'transparent',
                              transition: 'all 0.3s ease',
                            }}
                            onClick={() => handleAnswerChange(question._id, option)}
                          >
                            <FormControlLabel
                              value={option}
                              control={<Radio />}
                              label={<Typography variant="body1">{option}</Typography>}
                              sx={{ width: '100%', m: 0 }}
                            />
                          </Paper>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>

              {/* Navigation */}
              <Box display="flex" justifyContent="space-between" mt={3}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<NavigateBefore />}
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                >
                  Previous
                </Button>
                
                {currentQuestion < test.questions.length - 1 ? (
                  <Button 
                    variant="contained" 
                    size="large"
                    endIcon={<NavigateNext />}
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    size="large"
                    color="success"
                    onClick={() => setShowSubmitConfirm(true)}
                  >
                    Submit Test
                  </Button>
                )}
              </Box>
            </motion.div>
          </AnimatePresence>
        </Grid>

        {/* Question Navigator */}
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Question Navigator
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                <Chip label={`Answered: ${answered}`} size="small" color="success" />
                <Chip label={`Flagged: ${flagged.size}`} size="small" color="warning" />
                <Chip label={`Unanswered: ${unanswered}`} size="small" />
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1}>
                {test.questions.map((q, index) => {
                  const status = getQuestionStatus(q._id);
                  return (
                    <Tooltip key={index} title={`Question ${index + 1}`}>
                      <Button
                        size="small"
                        variant={index === currentQuestion ? "contained" : "outlined"}
                        onClick={() => setCurrentQuestion(index)}
                        sx={{
                          minWidth: 40,
                          height: 40,
                          p: 0,
                          background: index === currentQuestion 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : status === 'answered'
                            ? '#4caf5020'
                            : status === 'flagged'
                            ? '#ff980020'
                            : 'transparent',
                          borderColor: status === 'answered'
                            ? '#4caf50'
                            : status === 'flagged'
                            ? '#ff9800'
                            : '#ccc',
                        }}
                      >
                        {index + 1}
                      </Button>
                    </Tooltip>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitConfirm} onClose={() => setShowSubmitConfirm(false)}>
        <DialogTitle>Submit Test?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You have answered {answered} out of {test.questions.length} questions.
          </Alert>
          <Typography>
            Are you sure you want to submit the test? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitConfirm(false)}>Cancel</Button>
          <Button 
            onClick={submitTest} 
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Results Dialog */}
      <Dialog 
        open={showResults} 
        onClose={() => setShowResults(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <EmojiEvents sx={{ fontSize: 40, color: '#ffd700' }} />
            <Typography variant="h5" fontWeight={700}>Test Results</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Score Summary */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)' }}>
                <Typography variant="h3" fontWeight={700} color="primary">
                  {results?.score?.toFixed(2)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">Final Score</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={700} color="success.main">
                  {results?.correct}
                </Typography>
                <Typography variant="body2" color="text.secondary">Correct</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={700} color="error.main">
                  {results?.incorrect || (results?.total - results?.correct)}
                </Typography>
                <Typography variant="body2" color="text.secondary">Incorrect</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={700} color="text.secondary">
                  {results?.unanswered || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">Unanswered</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Detailed Results */}
          {results?.details && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Question-wise Analysis
              </Typography>
              <Box sx={{ maxHeight: 400, overflowY: 'auto', mt: 2 }}>
                {results.details.map((detail, index) => (
                  <Paper 
                    key={index} 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      mb: 2,
                      borderLeft: `4px solid ${detail.isCorrect ? '#4caf50' : '#f44336'}`,
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                      <Typography variant="body1" fontWeight={600}>
                        Question {index + 1}
                      </Typography>
                      <Chip 
                        label={detail.isCorrect ? 'Correct' : 'Incorrect'} 
                        color={detail.isCorrect ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {detail.question}
                    </Typography>
                    <Box display="flex" gap={2} flexWrap="wrap">
                      <Chip 
                        label={`Your Answer: ${detail.userAnswer || 'Not Answered'}`}
                        size="small"
                        color={detail.isCorrect ? 'success' : 'default'}
                      />
                      {!detail.isCorrect && (
                        <Chip 
                          label={`Correct Answer: ${detail.correctAnswer}`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowResults(false); setTest(null); setMode(null); setFormat(null); }}>
            Take Another Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MockTest;
