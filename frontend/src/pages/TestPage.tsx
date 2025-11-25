import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import axios from 'axios';
import TestInterface from '../components/test/TestInterface';

interface Question {
    id: string;
    content: string;
    options: { id: string; text: string }[];
}

interface Test {
    id: string;
    question_ids: string[];
    total_questions: number;
    duration: number;
}

const TestPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        const loadTestSession = async () => {
            if (!sessionId) {
                setError('No session ID provided');
                setLoading(false);
                return;
            }

            try {
                // Get session state to retrieve test ID
                const sessionResponse = await axios.get(
                    `/api/tests/sessions/${sessionId}/state`,
                    { withCredentials: true }
                );

                const sessionState = sessionResponse.data.state;
                const testIdFromSession = sessionState.test_id;

                // Get test details
                const testResponse = await axios.get(
                    `/api/tests/${testIdFromSession}`,
                    { withCredentials: true }
                );

                const testData = testResponse.data.test;
                setTest(testData);

                // Get questions for the test
                const questionsResponse = await axios.get(
                    `/api/tests/${testIdFromSession}/questions`,
                    { withCredentials: true }
                );

                setQuestions(questionsResponse.data.questions);
                setLoading(false);
            } catch (err: any) {
                console.error('Failed to load test session:', err);
                setError(err.response?.data?.error || 'Failed to load test session');
                setLoading(false);
            }
        };

        loadTestSession();
    }, [sessionId]);

    const handleTestComplete = (completedSessionId: string) => {
        navigate(`/results/${completedSessionId}`);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    gap: 2,
                }}
            >
                <CircularProgress size={60} />
                <Typography variant="h6">Loading test...</Typography>
            </Box>
        );
    }

    if (error || !test || !sessionId) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    p: 3,
                }}
            >
                <Alert severity="error" sx={{ maxWidth: 600 }}>
                    {error || 'Failed to load test'}
                </Alert>
            </Box>
        );
    }

    return (
        <TestInterface
            sessionId={sessionId}
            questions={questions}
            duration={test.duration}
            onTestComplete={handleTestComplete}
        />
    );
};

export default TestPage;
