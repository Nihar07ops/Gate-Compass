import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography,
    Grid,
    IconButton,
    CircularProgress,
    Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../utils/api';
import ValidationError from '../ValidationError';

interface QuestionOption {
    id: string;
    text: string;
}

interface Concept {
    id: string;
    name: string;
    category: string;
    description: string;
}

interface QuestionFormData {
    content: string;
    options: QuestionOption[];
    correct_answer: string;
    explanation: string;
    concept_id: string;
    sub_concept: string;
    difficulty: 'easy' | 'medium' | 'hard' | '';
    source: string;
    year_appeared: string;
}

const initialFormData: QuestionFormData = {
    content: '',
    options: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
    ],
    correct_answer: '',
    explanation: '',
    concept_id: '',
    sub_concept: '',
    difficulty: '',
    source: '',
    year_appeared: '',
};

const QuestionManager: React.FC = () => {
    const { showSuccess, showError, showWarning } = useToast();
    const [formData, setFormData] = useState<QuestionFormData>(initialFormData);
    const [concepts, setConcepts] = useState<Concept[]>([]);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    useEffect(() => {
        fetchConcepts();
    }, []);

    const fetchConcepts = async () => {
        try {
            const response = await axios.get('/api/admin/concepts');
            setConcepts(response.data.concepts);
        } catch (err: any) {
            console.error('Failed to fetch concepts:', err);
            showError(getErrorMessage(err));
        }
    };

    const validateForm = (): boolean => {
        const errors: string[] = [];

        if (!formData.content.trim()) {
            errors.push('Content is required');
        }

        if (!formData.concept_id) {
            errors.push('Concept is required');
        }

        if (!formData.difficulty) {
            errors.push('Difficulty is required');
        }

        if (!formData.source.trim()) {
            errors.push('Source is required');
        }

        if (!formData.explanation.trim()) {
            errors.push('Explanation is required');
        }

        if (formData.options.length < 2) {
            errors.push('At least 2 options are required');
        }

        formData.options.forEach((option) => {
            if (!option.text.trim()) {
                errors.push(`Option ${option.id} text is required`);
            }
        });

        if (!formData.correct_answer) {
            errors.push('Correct answer is required');
        } else if (!formData.options.find(opt => opt.id === formData.correct_answer)) {
            errors.push('Correct answer must match one of the option IDs');
        }

        if (formData.year_appeared) {
            const year = parseInt(formData.year_appeared, 10);
            const currentYear = new Date().getFullYear();
            if (isNaN(year) || year < 1990 || year > currentYear) {
                errors.push(`Year must be between 1990 and ${currentYear}`);
            }
        }

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors([]);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const payload = {
                content: formData.content.trim(),
                options: formData.options.map(opt => ({
                    id: opt.id,
                    text: opt.text.trim(),
                })),
                correct_answer: formData.correct_answer,
                explanation: formData.explanation.trim(),
                concept_id: formData.concept_id,
                sub_concept: formData.sub_concept.trim() || undefined,
                difficulty: formData.difficulty,
                source: formData.source.trim(),
                year_appeared: formData.year_appeared ? parseInt(formData.year_appeared, 10) : undefined,
            };

            await axios.post('/api/admin/questions', payload);
            showSuccess('Question created successfully!');
            setFormData(initialFormData);
            setValidationErrors([]);
        } catch (err: any) {
            showError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleAddOption = () => {
        const nextId = String.fromCharCode(65 + formData.options.length); // A, B, C, D...
        setFormData({
            ...formData,
            options: [...formData.options, { id: nextId, text: '' }],
        });
    };

    const handleRemoveOption = (index: number) => {
        if (formData.options.length <= 2) {
            showWarning('At least 2 options are required');
            return;
        }
        const newOptions = formData.options.filter((_, i) => i !== index);
        setFormData({ ...formData, options: newOptions });
    };

    const handleOptionChange = (index: number, text: string) => {
        const newOptions = [...formData.options];
        newOptions[index].text = text;
        setFormData({ ...formData, options: newOptions });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Add New Question
            </Typography>

            {validationErrors.length > 0 && (
                <ValidationError errors={validationErrors} />
            )}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Question Content */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Question Content"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            required
                        />
                    </Grid>

                    {/* Options */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Options
                        </Typography>
                        {formData.options.map((option, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <TextField
                                    label={`Option ${option.id}`}
                                    value={option.text}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    fullWidth
                                    required
                                />
                                <IconButton
                                    color="error"
                                    onClick={() => handleRemoveOption(index)}
                                    disabled={formData.options.length <= 2}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}
                        <Button
                            startIcon={<AddIcon />}
                            onClick={handleAddOption}
                            variant="outlined"
                            size="small"
                        >
                            Add Option
                        </Button>
                    </Grid>

                    {/* Correct Answer */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required>
                            <InputLabel>Correct Answer</InputLabel>
                            <Select
                                value={formData.correct_answer}
                                onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                                label="Correct Answer"
                            >
                                {formData.options.map((option) => (
                                    <MenuItem key={option.id} value={option.id}>
                                        {option.id}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Explanation */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Explanation"
                            value={formData.explanation}
                            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>

                    {/* Concept */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required>
                            <InputLabel>Concept</InputLabel>
                            <Select
                                value={formData.concept_id}
                                onChange={(e) => setFormData({ ...formData, concept_id: e.target.value })}
                                label="Concept"
                            >
                                {concepts.map((concept) => (
                                    <MenuItem key={concept.id} value={concept.id}>
                                        {concept.name} ({concept.category})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Sub Concept */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Sub Concept (Optional)"
                            value={formData.sub_concept}
                            onChange={(e) => setFormData({ ...formData, sub_concept: e.target.value })}
                        />
                    </Grid>

                    {/* Difficulty */}
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth required>
                            <InputLabel>Difficulty</InputLabel>
                            <Select
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                                label="Difficulty"
                            >
                                <MenuItem value="easy">Easy</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="hard">Hard</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Source */}
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Source (Textbook)"
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            required
                        />
                    </Grid>

                    {/* Year Appeared */}
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Year Appeared (Optional)"
                            type="number"
                            value={formData.year_appeared}
                            onChange={(e) => setFormData({ ...formData, year_appeared: e.target.value })}
                        />
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Question'}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default QuestionManager;
