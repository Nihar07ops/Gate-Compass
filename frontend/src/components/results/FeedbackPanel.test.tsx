import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeedbackPanel from './FeedbackPanel';
import React from 'react';

describe('FeedbackPanel', () => {
    const mockFeedback = {
        overall_message: 'Good performance! Keep practicing to improve further.',
        strengths: ['Data Structures', 'Problem Solving', 'Time Management'],
        weaknesses: [
            {
                concept_name: 'Algorithms',
                accuracy: 0.55,
                questions_attempted: 10,
            },
            {
                concept_name: 'Operating Systems',
                accuracy: 0.4,
                questions_attempted: 5,
            },
        ],
        recommendations: [
            {
                concept_name: 'Algorithms',
                textbook_chapters: [
                    'Cormen - Chapter 5: Sorting Algorithms',
                    'Cormen - Chapter 6: Searching Algorithms',
                ],
                practice_topics: ['Quick Sort', 'Merge Sort', 'Binary Search'],
                priority: 'high' as const,
            },
            {
                concept_name: 'Operating Systems',
                textbook_chapters: [
                    'Galvin - Chapter 3: Process Management',
                    'Galvin - Chapter 5: CPU Scheduling',
                ],
                practice_topics: ['Process Synchronization', 'Deadlock Prevention'],
                priority: 'medium' as const,
            },
        ],
    };

    it('shows recommendations for weak concepts', () => {
        render(<FeedbackPanel feedback={mockFeedback} />);

        // Check that weak concepts are shown in recommendations (multiple instances expected)
        const algorithmsElements = screen.getAllByText('Algorithms');
        expect(algorithmsElements.length).toBeGreaterThan(0);

        const osElements = screen.getAllByText('Operating Systems');
        expect(osElements.length).toBeGreaterThan(0);
    });

    it('displays textbook chapter recommendations', () => {
        render(<FeedbackPanel feedback={mockFeedback} />);

        // Check that textbook chapters are displayed
        expect(screen.getByText('Cormen - Chapter 5: Sorting Algorithms')).toBeInTheDocument();
        expect(screen.getByText('Cormen - Chapter 6: Searching Algorithms')).toBeInTheDocument();
        expect(screen.getByText('Galvin - Chapter 3: Process Management')).toBeInTheDocument();
    });

    it('displays practice topic recommendations', () => {
        render(<FeedbackPanel feedback={mockFeedback} />);

        // Check that practice topics are displayed
        expect(screen.getByText('Quick Sort')).toBeInTheDocument();
        expect(screen.getByText('Merge Sort')).toBeInTheDocument();
        expect(screen.getByText('Binary Search')).toBeInTheDocument();
        expect(screen.getByText('Process Synchronization')).toBeInTheDocument();
    });

    it('displays priority levels for recommendations', () => {
        render(<FeedbackPanel feedback={mockFeedback} />);

        // Check that priority chips are displayed
        expect(screen.getByText('High Priority')).toBeInTheDocument();
        expect(screen.getByText('Medium Priority')).toBeInTheDocument();
    });

    it('displays overall feedback message', () => {
        render(<FeedbackPanel feedback={mockFeedback} />);

        expect(screen.getByText('Good performance! Keep practicing to improve further.')).toBeInTheDocument();
    });

    it('displays strengths section', () => {
        render(<FeedbackPanel feedback={mockFeedback} />);

        expect(screen.getByText('Your Strengths')).toBeInTheDocument();
        expect(screen.getByText('Data Structures')).toBeInTheDocument();
        expect(screen.getByText('Problem Solving')).toBeInTheDocument();
        expect(screen.getByText('Time Management')).toBeInTheDocument();
    });

    it('displays weaknesses section with accuracy', () => {
        render(<FeedbackPanel feedback={mockFeedback} />);

        expect(screen.getByText('Areas for Improvement')).toBeInTheDocument();

        // Check that weaknesses are displayed with accuracy
        expect(screen.getByText(/55\.0% accuracy/i)).toBeInTheDocument();
        expect(screen.getByText(/40\.0% accuracy/i)).toBeInTheDocument();
    });

    it('displays number of questions attempted for weak concepts', () => {
        render(<FeedbackPanel feedback={mockFeedback} />);

        // Check that question counts are displayed
        expect(screen.getByText(/10 questions/i)).toBeInTheDocument();
        expect(screen.getByText(/5 questions/i)).toBeInTheDocument();
    });

    it('handles empty strengths gracefully', () => {
        const feedbackWithNoStrengths = {
            ...mockFeedback,
            strengths: [],
        };

        render(<FeedbackPanel feedback={feedbackWithNoStrengths} />);

        expect(screen.getByText('Your Strengths')).toBeInTheDocument();
        expect(screen.getByText('Keep practicing to build your strengths')).toBeInTheDocument();
    });

    it('handles empty weaknesses gracefully', () => {
        const feedbackWithNoWeaknesses = {
            ...mockFeedback,
            weaknesses: [],
        };

        render(<FeedbackPanel feedback={feedbackWithNoWeaknesses} />);

        expect(screen.getByText('Areas for Improvement')).toBeInTheDocument();
        expect(screen.getByText('Great job! No significant weak areas identified.')).toBeInTheDocument();
    });

    it('handles empty recommendations gracefully', () => {
        const feedbackWithNoRecommendations = {
            ...mockFeedback,
            recommendations: [],
        };

        render(<FeedbackPanel feedback={feedbackWithNoRecommendations} />);

        expect(screen.getByText('Recommendations')).toBeInTheDocument();
        expect(screen.getByText('Excellent performance! Continue with your current study approach.')).toBeInTheDocument();
    });

    it('displays component title', () => {
        render(<FeedbackPanel feedback={mockFeedback} />);

        expect(screen.getByText('Personalized Feedback')).toBeInTheDocument();
    });

    it('handles low priority recommendations', () => {
        const feedbackWithLowPriority = {
            ...mockFeedback,
            recommendations: [
                {
                    concept_name: 'Computer Networks',
                    textbook_chapters: ['Tanenbaum - Chapter 1'],
                    practice_topics: ['OSI Model'],
                    priority: 'low' as const,
                },
            ],
        };

        render(<FeedbackPanel feedback={feedbackWithLowPriority} />);

        expect(screen.getByText('Low Priority')).toBeInTheDocument();
    });
});
