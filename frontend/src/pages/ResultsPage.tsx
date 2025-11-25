import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    AppBar,
    Toolbar,
    Button,
    CircularProgress,
    Alert,
    Paper,
    Grid,
    Divider,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import ConceptAnalysis from '../components/results/ConceptAnalysis';
import FeedbackPanel from '../components/results/FeedbackPanel';
import SolutionViewer from '../components/results/SolutionViewer';
import ScoreCard from '../components/results/ScoreCard';

interface TestResult {
    id: string;
    session_id: string;
    user_id: string;
    score: number;
    total_questions: number;
    correct_answers: number;
    incorrect_answers: number;
    unanswered: number;
    percentage: number;
    concept_performance: ConceptPerformance[];
    feedback: Feedback;
    created_at: string;
}

interface ConceptPerformance {
    concept_id: string;
    concept_name: string;
    total_questions: number;
    correct_answers: number;
    accuracy: number;
    average_time_per_question: number;
}

interface Feedback {
    overall_message: string;
    strengths: string[];
    weaknesses: ConceptWeakness[];
    recommendations: Recommendation[];
}

interface ConceptWeakness {
    concept_name: string;
    accuracy: number;
    questions_attempted: number;
}

interface Recommendation {
    concept_name: string;
    textbook_chapters: string[];
    practice_topics: string[];
    priority: 'high' | 'medium' | 'low';
}

interface QuestionDetail {
    question_id: string;
    content: string;
    options: Array<{ id: string; text: string }>;
    user_answer: string | null;
    correct_answer: string;
    explanation: string;
    is_correct: boolean;
    time_spent: number;
    marked_for_review: boolean;
    concept: string;
    difficulty: string;
}

interface DetailedAnalysis {
    result: TestResult;
    session: {
        id: string;
        start_time: string;
        end_time: string;
        total_time_spent: number;
        status: string;
    };
    questions: QuestionDetail[];
}

/**
 * Results page displaying test scores, analytics, and detailed solutions
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 5.5
 */
const ResultsPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<DetailedAnalysis | null>(null);
    const [exportingPDF, setExportingPDF] = useState(false);

    useEffect(() => {
        fetchResults();
    }, [sessionId]);

    const fetchResults = async () => {
        if (!sessionId) {
            setError('Invalid session ID');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch detailed analysis
            const response = await axios.get<{ analysis: DetailedAnalysis }>(
                `/api/results/${sessionId}/analysis`,
                { withCredentials: true }
            );

            setAnalysis(response.data.analysis);
        } catch (err: any) {
            console.error('Failed to fetch results:', err);
            setError(err.response?.data?.error || 'Failed to load test results');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        setExportingPDF(true);
        try {
            // In a real implementation, this would call a backend endpoint
            // that generates a PDF using a library like PDFKit or Puppeteer
            alert('PDF export functionality will be implemented with backend support');
        } catch (err) {
            console.error('Failed to export PDF:', err);
        } finally {
            setExportingPDF(false);
        }
    };

    const handleExportCSV = () => {
        if (!analysis) return;

        // Generate CSV content
        const headers = ['Question #', 'Concept', 'Difficulty', 'Your Answer', 'Correct Answer', 'Result', 'Time (s)'];
        const rows = analysis.questions.map((q, index) => [
            (index + 1).toString(),
            q.concept,
            q.difficulty,
            q.user_answer || 'Not Answered',
            q.correct_answer,
            q.is_correct ? 'Correct' : 'Incorrect',
            q.time_spent.toString(),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `test-results-${sessionId}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !analysis) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error || 'Failed to load results'}</Alert>
                <Button
                    variant="contained"
                    startIcon={<HomeIcon />}
                    onClick={() => navigate('/dashboard')}
                    sx={{ mt: 2 }}
                >
                    Back to Dashboard
                </Button>
            </Container>
        );
    }

    const { result, session, questions } = analysis;

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Test Results
                    </Typography>
                    <Button
                        color="inherit"
                        startIcon={<HomeIcon />}
                        onClick={() => navigate('/dashboard')}
                    >
                        Dashboard
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {/* Score Card */}
                <ScoreCard result={result} session={session} />

                {/* Export Buttons */}
                <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Export Results
                    </Typography>
                    <Box display="flex" gap={2}>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportPDF}
                            disabled={exportingPDF}
                        >
                            {exportingPDF ? 'Exporting...' : 'Export as PDF'}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportCSV}
                        >
                            Export as CSV
                        </Button>
                    </Box>
                </Paper>

                <Grid container spacing={3}>
                    {/* Concept Analysis */}
                    <Grid item xs={12} lg={6}>
                        <ConceptAnalysis conceptPerformance={result.concept_performance} />
                    </Grid>

                    {/* Feedback Panel */}
                    <Grid item xs={12} lg={6}>
                        <FeedbackPanel feedback={result.feedback} />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Solution Viewer */}
                <SolutionViewer questions={questions} />
            </Container>
        </Box>
    );
};

export default ResultsPage;
