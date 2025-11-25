import React from 'react';
import {
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

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

interface Feedback {
    overall_message: string;
    strengths: string[];
    weaknesses: ConceptWeakness[];
    recommendations: Recommendation[];
}

interface FeedbackPanelProps {
    feedback: Feedback;
}

/**
 * Feedback panel showing strengths, weaknesses, and recommendations
 * Requirements: 7.4, 7.5
 */
const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback }) => {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'error';
            case 'medium':
                return 'warning';
            case 'low':
                return 'info';
            default:
                return 'default';
        }
    };

    const getPriorityLabel = (priority: string) => {
        return priority.charAt(0).toUpperCase() + priority.slice(1) + ' Priority';
    };

    return (
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
                Personalized Feedback
            </Typography>

            {/* Overall Message */}
            <Box
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                }}
            >
                <Typography variant="body1" fontWeight="medium">
                    {feedback.overall_message}
                </Typography>
            </Box>

            {/* Strengths */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                    Your Strengths
                </Typography>
                {feedback.strengths.length > 0 ? (
                    <List dense>
                        {feedback.strengths.map((strength, index) => (
                            <ListItem key={index}>
                                <ListItemIcon>
                                    <CheckCircleIcon color="success" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={strength} />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                        Keep practicing to build your strengths
                    </Typography>
                )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Weaknesses */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                    Areas for Improvement
                </Typography>
                {feedback.weaknesses.length > 0 ? (
                    <List dense>
                        {feedback.weaknesses.map((weakness, index) => (
                            <ListItem key={index}>
                                <ListItemIcon>
                                    <WarningIcon color="warning" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={weakness.concept_name}
                                    secondary={`${(weakness.accuracy * 100).toFixed(1)}% accuracy (${weakness.questions_attempted} questions)`}
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                        Great job! No significant weak areas identified.
                    </Typography>
                )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Recommendations */}
            <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ mr: 1, color: 'info.main' }} />
                    Recommendations
                </Typography>
                {feedback.recommendations.length > 0 ? (
                    <Box>
                        {feedback.recommendations.map((rec, index) => (
                            <Accordion key={index} defaultExpanded={index === 0}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography sx={{ flexGrow: 1 }}>
                                            {rec.concept_name}
                                        </Typography>
                                        <Chip
                                            label={getPriorityLabel(rec.priority)}
                                            color={getPriorityColor(rec.priority) as any}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        />
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {/* Textbook Chapters */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                            <MenuBookIcon fontSize="small" sx={{ mr: 0.5 }} />
                                            Recommended Reading:
                                        </Typography>
                                        <List dense>
                                            {rec.textbook_chapters.map((chapter, idx) => (
                                                <ListItem key={idx} sx={{ pl: 3 }}>
                                                    <ListItemText
                                                        primary={chapter}
                                                        primaryTypographyProps={{ variant: 'body2' }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>

                                    {/* Practice Topics */}
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Practice Suggestions:
                                        </Typography>
                                        <List dense>
                                            {rec.practice_topics.map((topic, idx) => (
                                                <ListItem key={idx} sx={{ pl: 3 }}>
                                                    <ListItemText
                                                        primary={topic}
                                                        primaryTypographyProps={{ variant: 'body2' }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                        Excellent performance! Continue with your current study approach.
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

export default FeedbackPanel;
