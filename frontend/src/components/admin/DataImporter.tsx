import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Chip,
    Divider,
    TextField,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';

interface ImportError {
    index: number;
    question: any;
    error: string;
}

interface ImportResult {
    total: number;
    successful: number;
    failed: number;
    errors: ImportError[];
}

const DataImporter: React.FC = () => {
    const [jsonInput, setJsonInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [result, setResult] = useState<ImportResult | null>(null);
    const [progress, setProgress] = useState(0);

    const handleImport = async () => {
        setError('');
        setResult(null);
        setProgress(0);

        // Validate JSON
        let parsedData;
        try {
            parsedData = JSON.parse(jsonInput);
        } catch (err) {
            setError('Invalid JSON format. Please check your input.');
            return;
        }

        if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
            setError('JSON must contain a "questions" array');
            return;
        }

        if (parsedData.questions.length === 0) {
            setError('Questions array cannot be empty');
            return;
        }

        setLoading(true);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await axios.post('/api/admin/questions/import', parsedData);

            clearInterval(progressInterval);
            setProgress(100);

            setResult(response.data.result);

            if (response.data.result.failed === 0) {
                setJsonInput(''); // Clear input on complete success
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to import questions');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setJsonInput(content);
        };
        reader.readAsText(file);
    };

    const exampleJson = {
        questions: [
            {
                content: "What is the time complexity of binary search?",
                options: [
                    { id: "A", text: "O(n)" },
                    { id: "B", text: "O(log n)" },
                    { id: "C", text: "O(n^2)" },
                    { id: "D", text: "O(1)" }
                ],
                correct_answer: "B",
                explanation: "Binary search divides the search space in half with each iteration, resulting in logarithmic time complexity.",
                concept_id: "concept-uuid-here",
                difficulty: "medium",
                source: "Cormen - Introduction to Algorithms",
                year_appeared: 2020
            }
        ]
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Bulk Question Import
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Import multiple questions at once using JSON format
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {result && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: result.failed === 0 ? 'success.light' : 'warning.light' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        {result.failed === 0 ? (
                            <CheckCircleIcon color="success" fontSize="large" />
                        ) : (
                            <ErrorIcon color="warning" fontSize="large" />
                        )}
                        <Box>
                            <Typography variant="h6">
                                Import {result.failed === 0 ? 'Completed' : 'Completed with Errors'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                <Chip label={`Total: ${result.total}`} size="small" />
                                <Chip label={`Success: ${result.successful}`} color="success" size="small" />
                                {result.failed > 0 && (
                                    <Chip label={`Failed: ${result.failed}`} color="error" size="small" />
                                )}
                            </Box>
                        </Box>
                    </Box>

                    {result.errors.length > 0 && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" gutterBottom>
                                Errors:
                            </Typography>
                            <List dense>
                                {result.errors.map((err, idx) => (
                                    <ListItem key={idx}>
                                        <ListItemText
                                            primary={`Question ${err.index + 1}: ${err.error}`}
                                            secondary={err.question.content?.substring(0, 100) || 'No content'}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </Paper>
            )}

            {loading && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>
                        Importing questions... {progress}%
                    </Typography>
                    <LinearProgress variant="determinate" value={progress} />
                </Box>
            )}

            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadFileIcon />}
                        sx={{ mr: 2 }}
                    >
                        Upload JSON File
                        <input
                            type="file"
                            accept=".json"
                            hidden
                            onChange={handleFileUpload}
                        />
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                        or paste JSON below
                    </Typography>
                </Box>

                <TextField
                    fullWidth
                    multiline
                    rows={15}
                    label="JSON Data"
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder={JSON.stringify(exampleJson, null, 2)}
                    variant="outlined"
                    sx={{ fontFamily: 'monospace', mb: 2 }}
                />

                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleImport}
                    disabled={loading || !jsonInput.trim()}
                    startIcon={loading ? <CircularProgress size={20} /> : <UploadFileIcon />}
                >
                    {loading ? 'Importing...' : 'Import Questions'}
                </Button>
            </Paper>

            <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                    JSON Format Example
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Your JSON should follow this structure:
                </Typography>
                <Box
                    component="pre"
                    sx={{
                        bgcolor: 'grey.900',
                        color: 'grey.100',
                        p: 2,
                        borderRadius: 1,
                        overflow: 'auto',
                        fontSize: '0.875rem',
                    }}
                >
                    {JSON.stringify(exampleJson, null, 2)}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Note: Make sure to use valid concept IDs from your database. The sub_concept and year_appeared fields are optional.
                </Typography>
            </Paper>
        </Box>
    );
};

export default DataImporter;
