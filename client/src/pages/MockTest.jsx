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
} from '@mui/material';
import api from '../utils/api';
import { motion } from 'framer-motion';

const MockTest = () => {
  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  const generateTest = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/generate-test', {
        difficulty: 'medium',
        topicCount: 10
      });
      setTest(response.data);
      setAnswers({});
      setCurrentQuestion(0);
    } catch (error) {
      console.error('Error generating test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
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
    } catch (error) {
      console.error('Error submitting test:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!test) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h4" gutterBottom>Mock Test Generator</Typography>
        <Button variant="contained" size="large" onClick={generateTest} disabled={loading}>
          {loading ? 'Generating...' : 'Generate New Test'}
        </Button>
      </Box>
    );
  }

  const question = test.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;

  return (
    <Box>
      <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Question {currentQuestion + 1} of {test.questions.length}
      </Typography>
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent>
            <Typography variant="body1" gutterBottom>{question.text}</Typography>
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <RadioGroup
                value={answers[question._id] || ''}
                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
              >
                {question.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>
      </motion.div>
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
        >
          Previous
        </Button>
        {currentQuestion < test.questions.length - 1 ? (
          <Button variant="contained" onClick={() => setCurrentQuestion(currentQuestion + 1)}>
            Next
          </Button>
        ) : (
          <Button variant="contained" color="success" onClick={submitTest}>
            Submit Test
          </Button>
        )}
      </Box>
      <Dialog open={showResults} onClose={() => setShowResults(false)}>
        <DialogTitle>Test Results</DialogTitle>
        <DialogContent>
          <Typography>Score: {results?.score}%</Typography>
          <Typography>Correct: {results?.correct}/{results?.total}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowResults(false); setTest(null); }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MockTest;
