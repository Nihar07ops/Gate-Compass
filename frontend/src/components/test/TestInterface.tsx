import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    AppBar,
    Toolbar,
    Grid,
    Alert,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import FlagIcon from '@mui/icons-material/Flag';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import Timer from './Timer';
import QuestionPalette, { QuestionStatus } from './QuestionPalette';
import QuestionTracker from './QuestionTracker';

interface Question {
    id: string;
    content: string;
    options: { id: string; text: string }[];
}

interface TestInterfaceProps {
    sessionId: string;
    questions: Question[];
    duration: number; // in seconds
    onTestComplete: (sessionId: string) => void;
}

interface SessionState {
    answers: Record<string, string>;
    markedForReview: Record<string, boolean>;
    questionTimes: Record<string, number>;
}

const TestInterface: React.FC<TestInterfaceProps> = ({
    sessionId,
    questions,
    duration,
    onTestComplete,
}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
    const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isTimerRunning, setIsTimerRunning] = useState(true);

    const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastSaveRef = useRef<SessionState>({
        answers: {},
        markedForReview: {},
        questionTimes: {},
    });

    const currentQuestion = questions[currentQuestionIndex];

    // Load session state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem(`test-session-${sessionId}`);
        if (savedState) {
            try {
                const state: SessionState = JSON.parse(savedState);
                setAnswers(state.answers || {});
                setMarkedForReview(state.markedForReview || {});
                setQuestionTimes(state.questionTimes || {});
            } catch (err) {
                console.error('Failed to load session state:', err);
            }
        }
    }, [sessionId]);

    // Save session state to localStorage
    const saveToLocalStorage = useCallback(() => {
        const state: SessionState = {
            answers,
            markedForReview,
            questionTimes,
        };
        localStorage.setItem(`test-session-${sessionId}`, JSON.stringify(state));
    }, [sessionId, answers, markedForReview, questionTimes]);

    // Debounced auto-save to localStorage (saves 500ms after last change)
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            saveToLocalStorage();
        }, 500);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [saveToLocalStorage]);

    // Auto-save to server every 30 seconds
    useEffect(() => {
        autoSaveIntervalRef.current = setInterval(() => {
            saveAnswersToServer();
        }, 30000);

        return () => {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
        };
    }, []);

    const saveAnswersToServer = async () => {
        try {
            // Save all answers that have changed since last save
            const answersToSave = Object.keys(answers).filter(
                (qId) => answers[qId] !== lastSaveRef.current.answers[qId] ||
                    markedForReview[qId] !== lastSaveRef.current.markedForReview[qId]
            );

            for (const questionId of answersToSave) {
                await axios.put(
                    `/api/tests/sessions/${sessionId}/answer`,
                    {
                        questionId,
                        selectedAnswer: answers[questionId],
                        markedForReview: markedForReview[questionId] || false,
                    },
                    { withCredentials: true }
                );
            }

            // Save all question times that have changed
            const timesToSave = Object.keys(questionTimes).filter(
                (qId) => questionTimes[qId] !== lastSaveRef.current.questionTimes[qId]
            );

            for (const questionId of timesToSave) {
                await axios.put(
                    `/api/tests/sessions/${sessionId}/time`,
                    {
                        questionId,
                        timeSpent: questionTimes[questionId],
                    },
                    { withCredentials: true }
                );
            }

            lastSaveRef.current = { answers, markedForReview, questionTimes };
        } catch (err) {
            console.error('Auto-save failed:', err);
        }
    };

    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const handleMarkForReview = () => {
        setMarkedForReview((prev) => ({
            ...prev,
            [currentQuestion.id]: !prev[currentQuestion.id],
        }));
    };

    const handleTimeUpdate = (questionId: string, timeSpent: number) => {
        setQuestionTimes((prev) => ({ ...prev, [questionId]: timeSpent }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleQuestionSelect = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    const handleSubmitClick = () => {
        setShowSubmitDialog(true);
    };

    const handleSubmitConfirm = async () => {
        setIsSubmitting(true);
        setIsTimerRunning(false);
        setError(null);

        try {
            // Save all pending changes before submitting
            await saveAnswersToServer();

            // Submit the test
            await axios.post(
                `/api/tests/sessions/${sessionId}/submit`,
                {},
                { withCredentials: true }
            );

            // Clear localStorage
            localStorage.removeItem(`test-session-${sessionId}`);

            // Notify parent component
            onTestComplete(sessionId);
        } catch (err: any) {
            console.error('Failed to submit test:', err);
            setError(err.response?.data?.error || 'Failed to submit test');
            setIsSubmitting(false);
            setIsTimerRunning(true);
        }
    };

    const handleTimeout = async () => {
        setIsTimerRunning(false);
        setError(null);

        try {
            // Save all pending changes before auto-submitting
            await saveAnswersToServer();

            // Auto-submit the test
            await axios.post(
                `/api/tests/sessions/${sessionId}/auto-submit`,
                {},
                { withCredentials: true }
            );

            // Clear localStorage
            localStorage.removeItem(`test-session-${sessionId}`);

            // Notify parent component
            onTestComplete(sessionId);
        } catch (err: any) {
            console.error('Failed to auto-submit test:', err);
            setError(err.response?.data?.error || 'Failed to auto-submit test');
        }
    };

    const getQuestionStatuses = (): QuestionStatus[] => {
        return questions.map((q) => ({
            questionId: q.id,
            answered: !!answers[q.id],
            markedForReview: !!markedForReview[q.id],
        }));
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar position="sticky">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        GATE COMPASS - Mock Test
                    </Typography>
                    <Timer
                        initialSeconds={duration}
                        onTimeout={handleTimeout}
                        isRunning={isTimerRunning}
                    />
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={2}>
                    <Grid item xs={12} md={9}>
                        <Paper elevation={2} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </Typography>

                            <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                                {currentQuestion.content}
                            </Typography>

                            <FormControl component="fieldset" fullWidth>
                                <RadioGroup
                                    value={answers[currentQuestion.id] || ''}
                                    onChange={(e) =>
                                        handleAnswerChange(currentQuestion.id, e.target.value)
                                    }
                                >
                                    {currentQuestion.options.map((option) => (
                                        <FormControlLabel
                                            key={option.id}
                                            value={option.id}
                                            control={<Radio />}
                                            label={option.text}
                                            sx={{ mb: 1 }}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>

                            <Box
                                sx={{
                                    mt: 3,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    startIcon={<NavigateBeforeIcon />}
                                    onClick={handlePrevious}
                                    disabled={currentQuestionIndex === 0}
                                >
                                    Previous
                                </Button>

                                <Button
                                    variant="outlined"
                                    color={markedForReview[currentQuestion.id] ? 'warning' : 'inherit'}
                                    startIcon={<FlagIcon />}
                                    onClick={handleMarkForReview}
                                >
                                    {markedForReview[currentQuestion.id]
                                        ? 'Unmark Review'
                                        : 'Mark for Review'}
                                </Button>

                                {currentQuestionIndex === questions.length - 1 ? (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<SendIcon />}
                                        onClick={handleSubmitClick}
                                    >
                                        Submit Test
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        endIcon={<NavigateNextIcon />}
                                        onClick={handleNext}
                                    >
                                        Next
                                    </Button>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <QuestionPalette
                            questions={getQuestionStatuses()}
                            currentQuestionIndex={currentQuestionIndex}
                            onQuestionSelect={handleQuestionSelect}
                        />
                    </Grid>
                </Grid>
            </Container>

            <QuestionTracker
                questionId={currentQuestion.id}
                onTimeUpdate={handleTimeUpdate}
                isActive={isTimerRunning}
            />

            <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
                <DialogTitle>Submit Test</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to submit the test? You have answered{' '}
                        {Object.keys(answers).length} out of {questions.length} questions.
                    </Typography>
                    {Object.keys(answers).length < questions.length && (
                        <Typography color="warning.main" sx={{ mt: 1 }}>
                            Warning: You have unanswered questions.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowSubmitDialog(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitConfirm}
                        variant="contained"
                        color="success"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TestInterface;
