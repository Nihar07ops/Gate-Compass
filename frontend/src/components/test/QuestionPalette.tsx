import React from 'react';
import { Box, Button, Paper, Typography, Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import FlagIcon from '@mui/icons-material/Flag';

export interface QuestionStatus {
    questionId: string;
    answered: boolean;
    markedForReview: boolean;
}

interface QuestionPaletteProps {
    questions: QuestionStatus[];
    currentQuestionIndex: number;
    onQuestionSelect: (index: number) => void;
}

const QuestionPalette: React.FC<QuestionPaletteProps> = ({
    questions,
    currentQuestionIndex,
    onQuestionSelect,
}) => {
    const getQuestionIcon = (status: QuestionStatus) => {
        if (status.markedForReview) {
            return <FlagIcon fontSize="small" />;
        }
        if (status.answered) {
            return <CheckCircleIcon fontSize="small" />;
        }
        return <RadioButtonUncheckedIcon fontSize="small" />;
    };

    const getQuestionColor = (status: QuestionStatus, index: number) => {
        if (index === currentQuestionIndex) {
            return 'primary';
        }
        if (status.markedForReview) {
            return 'warning';
        }
        if (status.answered) {
            return 'success';
        }
        return 'inherit';
    };

    const getQuestionVariant = (index: number) => {
        return index === currentQuestionIndex ? 'contained' : 'outlined';
    };

    return (
        <Paper elevation={2} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                Question Palette
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CheckCircleIcon fontSize="small" color="success" />
                    <Typography variant="caption">Answered</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <RadioButtonUncheckedIcon fontSize="small" />
                    <Typography variant="caption">Not Answered</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <FlagIcon fontSize="small" color="warning" />
                    <Typography variant="caption">Marked for Review</Typography>
                </Box>
            </Box>

            <Grid container spacing={1}>
                {questions.map((status, index) => (
                    <Grid item xs={3} key={status.questionId}>
                        <Button
                            fullWidth
                            variant={getQuestionVariant(index)}
                            color={getQuestionColor(status, index)}
                            onClick={() => onQuestionSelect(index)}
                            startIcon={getQuestionIcon(status)}
                            sx={{ minWidth: 0 }}
                        >
                            {index + 1}
                        </Button>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2">
                    Answered: {questions.filter((q) => q.answered).length} / {questions.length}
                </Typography>
                <Typography variant="body2">
                    Marked: {questions.filter((q) => q.markedForReview).length}
                </Typography>
            </Box>
        </Paper>
    );
};

export default QuestionPalette;
