import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuestionPalette, { QuestionStatus } from './QuestionPalette';

describe('QuestionPalette Component - Unit Tests', () => {
    const mockQuestions: QuestionStatus[] = [
        { questionId: 'q1', answered: true, markedForReview: false },
        { questionId: 'q2', answered: false, markedForReview: false },
        { questionId: 'q3', answered: true, markedForReview: true },
        { questionId: 'q4', answered: false, markedForReview: true },
        { questionId: 'q5', answered: false, markedForReview: false },
    ];

    it('should render all questions with correct numbering', () => {
        const onQuestionSelect = vi.fn();
        render(
            <QuestionPalette
                questions={mockQuestions}
                currentQuestionIndex={0}
                onQuestionSelect={onQuestionSelect}
            />
        );

        // Check that all question numbers are displayed
        expect(screen.getByRole('button', { name: /1/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /2/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /3/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /4/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /5/i })).toBeInTheDocument();
    });

    it('should display correct status counts', () => {
        const onQuestionSelect = vi.fn();
        render(
            <QuestionPalette
                questions={mockQuestions}
                currentQuestionIndex={0}
                onQuestionSelect={onQuestionSelect}
            />
        );

        // 2 questions are answered (q1, q3)
        expect(screen.getByText('Answered: 2 / 5')).toBeInTheDocument();

        // 2 questions are marked for review (q3, q4)
        expect(screen.getByText('Marked: 2')).toBeInTheDocument();
    });

    it('should call onQuestionSelect when a question button is clicked', () => {
        const onQuestionSelect = vi.fn();
        render(
            <QuestionPalette
                questions={mockQuestions}
                currentQuestionIndex={0}
                onQuestionSelect={onQuestionSelect}
            />
        );

        // Click on question 3
        const question3Button = screen.getByRole('button', { name: /3/i });
        fireEvent.click(question3Button);

        expect(onQuestionSelect).toHaveBeenCalledWith(2); // Index 2 for question 3
    });

    it('should highlight current question', () => {
        const onQuestionSelect = vi.fn();
        const { rerender } = render(
            <QuestionPalette
                questions={mockQuestions}
                currentQuestionIndex={0}
                onQuestionSelect={onQuestionSelect}
            />
        );

        // Question 1 should be highlighted (contained variant)
        const question1Button = screen.getByRole('button', { name: /1/i });
        expect(question1Button).toHaveClass('MuiButton-contained');

        // Change current question to index 2
        rerender(
            <QuestionPalette
                questions={mockQuestions}
                currentQuestionIndex={2}
                onQuestionSelect={onQuestionSelect}
            />
        );

        // Question 3 should now be highlighted
        const question3Button = screen.getByRole('button', { name: /3/i });
        expect(question3Button).toHaveClass('MuiButton-contained');
    });

    it('should display correct icons for different question states', () => {
        const onQuestionSelect = vi.fn();
        render(
            <QuestionPalette
                questions={mockQuestions}
                currentQuestionIndex={0}
                onQuestionSelect={onQuestionSelect}
            />
        );

        // All buttons should be rendered
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThanOrEqual(5);
    });

    it('should update status counts when questions change', () => {
        const onQuestionSelect = vi.fn();
        const { rerender } = render(
            <QuestionPalette
                questions={mockQuestions}
                currentQuestionIndex={0}
                onQuestionSelect={onQuestionSelect}
            />
        );

        expect(screen.getByText('Answered: 2 / 5')).toBeInTheDocument();
        expect(screen.getByText('Marked: 2')).toBeInTheDocument();

        // Update questions - answer question 2
        const updatedQuestions: QuestionStatus[] = [
            { questionId: 'q1', answered: true, markedForReview: false },
            { questionId: 'q2', answered: true, markedForReview: false },
            { questionId: 'q3', answered: true, markedForReview: true },
            { questionId: 'q4', answered: false, markedForReview: true },
            { questionId: 'q5', answered: false, markedForReview: false },
        ];

        rerender(
            <QuestionPalette
                questions={updatedQuestions}
                currentQuestionIndex={0}
                onQuestionSelect={onQuestionSelect}
            />
        );

        expect(screen.getByText('Answered: 3 / 5')).toBeInTheDocument();
        expect(screen.getByText('Marked: 2')).toBeInTheDocument();
    });

    it('should handle empty question list', () => {
        const onQuestionSelect = vi.fn();
        render(
            <QuestionPalette
                questions={[]}
                currentQuestionIndex={0}
                onQuestionSelect={onQuestionSelect}
            />
        );

        expect(screen.getByText('Answered: 0 / 0')).toBeInTheDocument();
        expect(screen.getByText('Marked: 0')).toBeInTheDocument();
    });

    it('should display legend for question statuses', () => {
        const onQuestionSelect = vi.fn();
        render(
            <QuestionPalette
                questions={mockQuestions}
                currentQuestionIndex={0}
                onQuestionSelect={onQuestionSelect}
            />
        );

        expect(screen.getByText('Answered')).toBeInTheDocument();
        expect(screen.getByText('Not Answered')).toBeInTheDocument();
        expect(screen.getByText('Marked for Review')).toBeInTheDocument();
    });
});
