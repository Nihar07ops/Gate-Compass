import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Divider,
    ToggleButtonGroup,
    ToggleButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TimerIcon from '@mui/icons-material/Timer';
import FlagIcon from '@mui/icons-material/Flag';

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

interface SolutionViewerProps {
    questions: QuestionDetail[];
}

/**
 * Solution viewer displaying correct answers with explanations
 * Requirements: 7.2, 5.5
 */
const SolutionViewer: React.FC<SolutionViewerProps> = ({ questions }) => {
    const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy':
                return 'success';
            case 'medium':
                return 'warning';
            case 'hard':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (question: QuestionDetail) => {
        if (!question.user_answer) {
            return <HelpOutlineIcon color="warning" />;
        }
        return question.is_correct ? (
            <CheckCircleIcon color="success" />
        ) : (
            <CancelIcon color="error" />
        );
    };

    const getStatusText = (question: QuestionDetail) => {
        if (!question.user_answer) return 'Unanswered';
        return question.is_correct ? 'Correct' : 'Incorrect';
    };

    const getStatusColor = (question: QuestionDetail) => {
        if (!question.user_answer) return 'warning';
        return question.is_correct ? 'success' : 'error';
    };

    const filteredQuestions = questions.filter((q) => {
        switch (filter) {
            case 'correct':
                return q.is_correct;
            case 'incorrect':
                return q.user_answer && !q.is_correct;
            case 'unanswered':
                return !q.user_answer;
            default:
                return true;
        }
    });

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                    Detailed Solutions
                </Typography>

                {/* Filter Toggle */}
                <ToggleButtonGroup
                    value={filter}
                    exclusive
                    onChange={(_, newFilter) => {
                        if (newFilter !== null) {
                            setFilter(newFilter);
                        }
                    }}
                    size="small"
                >
                    <ToggleButton value="all">
                        All ({questions.length})
                    </ToggleButton>
                    <ToggleButton value="correct">
                        Correct ({questions.filter(q => q.is_correct).length})
                    </ToggleButton>
                    <ToggleButton value="incorrect">
                        Incorrect ({questions.filter(q => q.user_answer && !q.is_correct).length})
                    </ToggleButton>
                    <ToggleButton value="unanswered">
                        Unanswered ({questions.filter(q => !q.user_answer).length})
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {filteredQuestions.length === 0 ? (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No questions match the selected filter.
                </Typography>
            ) : (
                filteredQuestions.map((question, index) => {
                    const actualIndex = questions.indexOf(question);
                    return (
                        <Accordion key={question.question_id} defaultExpanded={index === 0}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                                    {getStatusIcon(question)}
                                    <Typography sx={{ flexGrow: 1 }}>
                                        Question {actualIndex + 1}
                                    </Typography>
                                    <Chip
                                        label={getStatusText(question)}
                                        color={getStatusColor(question) as any}
                                        size="small"
                                    />
                                    <Chip
                                        label={question.difficulty}
                                        color={getDifficultyColor(question.difficulty) as any}
                                        size="small"
                                    />
                                    {question.marked_for_review && (
                                        <Chip
                                            icon={<FlagIcon />}
                                            label="Marked"
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                    <Chip
                                        icon={<TimerIcon />}
                                        label={formatTime(question.time_spent)}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                {/* Question Content */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body1" gutterBottom>
                                        <strong>Question:</strong>
                                    </Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                                        {question.content}
                                    </Typography>

                                    {/* Concept and Difficulty */}
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        <Chip label={`Concept: ${question.concept}`} size="small" />
                                    </Box>
                                </Box>

                                {/* Options */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body1" gutterBottom>
                                        <strong>Options:</strong>
                                    </Typography>
                                    <FormControl component="fieldset" fullWidth>
                                        <RadioGroup value={question.user_answer || ''}>
                                            {question.options.map((option) => {
                                                const isUserAnswer = option.id === question.user_answer;
                                                const isCorrectAnswer = option.id === question.correct_answer;

                                                let bgcolor = 'transparent';
                                                let borderColor = 'transparent';

                                                if (isCorrectAnswer) {
                                                    bgcolor = '#e8f5e9';
                                                    borderColor = '#4caf50';
                                                } else if (isUserAnswer && !isCorrectAnswer) {
                                                    bgcolor = '#ffebee';
                                                    borderColor = '#f44336';
                                                }

                                                return (
                                                    <Box
                                                        key={option.id}
                                                        sx={{
                                                            p: 1,
                                                            mb: 1,
                                                            borderRadius: 1,
                                                            bgcolor,
                                                            border: `2px solid ${borderColor}`,
                                                        }}
                                                    >
                                                        <FormControlLabel
                                                            value={option.id}
                                                            control={<Radio disabled />}
                                                            label={
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Typography>{option.text}</Typography>
                                                                    {isCorrectAnswer && (
                                                                        <Chip
                                                                            label="Correct Answer"
                                                                            color="success"
                                                                            size="small"
                                                                        />
                                                                    )}
                                                                    {isUserAnswer && !isCorrectAnswer && (
                                                                        <Chip
                                                                            label="Your Answer"
                                                                            color="error"
                                                                            size="small"
                                                                        />
                                                                    )}
                                                                </Box>
                                                            }
                                                        />
                                                    </Box>
                                                );
                                            })}
                                        </RadioGroup>
                                    </FormControl>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* Explanation */}
                                <Box>
                                    <Typography variant="body1" gutterBottom>
                                        <strong>Explanation:</strong>
                                    </Typography>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {question.explanation}
                                    </Typography>
                                </Box>

                                {/* Time Spent */}
                                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TimerIcon fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                        Time spent: {formatTime(question.time_spent)}
                                    </Typography>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    );
                })
            )}
        </Paper>
    );
};

export default SolutionViewer;
