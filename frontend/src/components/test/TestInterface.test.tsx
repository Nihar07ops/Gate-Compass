import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TestInterface from './TestInterface';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

// Mock child components
vi.mock('./Timer', () => ({
    default: ({ onTimeout, isRunning }: any) => (
        <div data-testid="timer">
            Timer Running: {isRunning ? 'Yes' : 'No'}
            <button onClick={onTimeout}>Trigger Timeout</button>
        </div>
    ),
}));

vi.mock('./QuestionPalette', () => ({
    default: ({ questions, currentQuestionIndex, onQuestionSelect }: any) => (
        <div data-testid="question-palette">
            <div>Current: {currentQuestionIndex}</div>
            {questions.map((q: any, idx: number) => (
                <button key={q.questionId} onClick={() => onQuestionSelect(idx)}>
                    Q{idx + 1}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('./QuestionTracker', () => ({
    default: ({ questionId, onTimeUpdate }: any) => (
        <div data-testid="question-tracker">
            Tracking: {questionId}
            <button onClick={() => onTimeUpdate(questionId, 30)}>Update Time</button>
        </div>
    ),
}));

describe('TestInterface Component - Unit Tests', () => {
    const mockQuestions = [
        {
            id: 'q1',
            content: 'What is 2+2?',
            options: [
                { id: 'a', text: '3' },
                { id: 'b', text: '4' },
                { id: 'c', text: '5' },
            ],
        },
        {
            id: 'q2',
            content: 'What is 3+3?',
            options: [
                { id: 'a', text: '5' },
                { id: 'b', text: '6' },
                { id: 'c', text: '7' },
            ],
        },
        {
            id: 'q3',
            content: 'What is 4+4?',
            options: [
                { id: 'a', text: '7' },
                { id: 'b', text: '8' },
                { id: 'c', text: '9' },
            ],
        },
    ];

    const mockOnTestComplete = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        localStorage.clear();
        mockedAxios.put = vi.fn().mockResolvedValue({ data: {} });
        mockedAxios.post = vi.fn().mockResolvedValue({ data: {} });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should render first question on mount', () => {
        render(
            <TestInterface
                sessionId="test-session-1"
                questions={mockQuestions}
                duration={10800}
                onTestComplete={mockOnTestComplete}
            />
        );

        expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
        expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
    });

    it('should navigate to next question when Next button is clicked', () => {
        render(
            <TestInterface
                sessionId="test-session-1"
                questions={mockQuestions}
                duration={10800}
                onTestComplete={mockOnTestComplete}
            />
        );

        expect(screen.getByText('What is 2+2?')).toBeInTheDocument();

        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);

        expect(screen.getByText('What is 3+3?')).toBeInTheDocument();
        expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
    });

    it('should navigate to previous question when Previous button is clicked', () => {
        render(
            <TestInterface
                sessionId="test-session-1"
                questions={mockQuestions}
                duration={10800}
                onTestComplete={mockOnTestComplete}
            />
        );

        // Navigate to question 2
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);

        expect(screen.getByText('What is 3+3?')).toBeInTheDocument();

        // Navigate back to question 1
        const previousButton = screen.getByRole('button', { name: /previous/i });
        fireEvent.click(previousButton);

        expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    });

    it('should disable Previous button on first question', () => {
        render(
            <TestInterface
                sessionId="test-session-1"
                questions={mockQuestions}
                duration={10800}
                onTestComplete={mockOnTestComplete}
            />
        );

        const previousButton = screen.getByRole('button', { name: /previous/i });
        expect(previousButton).toBeDisabled();
    });

    it('should show Submit button on last question', () => {
        render(
            <TestInterface
                sessionId="test-session-1"
                questions={mockQuestions}
                duration={10800}
                onTestComplete={mockOnTestComplete}
            />
        );

        // Navigate to last question
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);

        expect(screen.getByText('What is 4+4?')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit test/i })).toBeInTheDocument();
    });

    it('should save answer when option is selected', () => {
        render(
            <TestInterface
                sessionId="test-session-1"
                questions={mockQuestions}
                duration={10800}
                onTestComplete={mockOnTestComplete}
            />
        );

        const option = screen.getByLabelText('4');
        fireEvent.click(option);

        // Navigate to next question and back to verify answer is preserved
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);

        const previousButton = screen.getByRole('button', { name: /previous/i });
        fireEvent.click(previousButton);

        // Answer should still be selected
        const selectedOption = screen.getByLabelText('4') as HTMLInputElement;
        expect(selectedOption.checked).toBe(true);
    });

    it('should toggle mark for review when button is clicked', () => {
        render(
            <TestInterface
                sessionId="test-session-1"
                questions={mockQuestions}
                duration={10800}
                onTestComplete={mockOnTestComplete}
            />
        );

        const markButton = screen.getByRole('button', { name: /mark for review/i });
        fireEvent.click(markButton);

        expect(screen.getByRole('button', { name: /unmark review/i })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /unmark review/i }));

        expect(screen.getByRole('button', { name: /mark for review/i })).toBeInTheDocument();
    });

    it('should navigate to specific question via palette', () => {
        render(
            <TestInterface
                sessionId="test-session-1"
                questions={mockQuestions}
                duration={10800}
                onTestComplete={mockOnTestComplete}
            />
        );

        expect(screen.getByText('What is 2+2?')).toBeInTheDocument();

        // Click on Q3 in palette
        const q3Button = screen.getByRole('button', { name: 'Q3' });
        fireEvent.click(q3Button);

        expect(screen.getByText('What is 4+4?')).toBeInTheDocument();
        expect(screen.getByText('Question 3 of 3')).toBeInTheDocument();
    });

    it('should save answers to state when selected', () => {
        render(
            <TestInterface
                sessionId="test-session-1"
                questions={mockQuestions}
                duration={10800}
                onTestComplete={mockOnTestComplete}
            />
        );

        // Select an answer
        const option = screen.getByLabelText('4');
        fireEvent.click(option);

        // Verify answer is selected
        const selectedOption = screen.getByLabelText('4') as HTMLInputElement;
        expect(selectedOption.checked).toBe(true);
    });

    it('should show submit confirmation dialog', () => {
        render(
            <TestInterface
                sessionId="test-session-1"
                questions={mockQuestions}
                duration={10800}
                onTestComplete={mockOnTestComplete}
            />
        );

        // Navigate to last question
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);

        // Click submit
        const submitButton = screen.getByRole('button', { name: /submit test/i });
        fireEvent.click(submitButton);

        expect(screen.getByText(/are you sure you want to submit/i)).toBeInTheDocument();
    });

    it('should display submit confirmation with answer count', () => {
        render(
            <TestInterface
                sessionId="test-session-1"
                questions={mockQuestions}
                duration={10800}
                onTestComplete={mockOnTestComplete}
            />
        );

        // Answer one question
        const option = screen.getByLabelText('4');
        fireEvent.click(option);

        // Navigate to last question
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);

        // Click submit
        const submitButton = screen.getByRole('button', { name: /submit test/i });
        fireEvent.click(submitButton);

        // Verify dialog shows answer count
        expect(screen.getByText(/you have answered 1 out of 3 questions/i)).toBeInTheDocument();
    });

    it('should pass timer props correctly', () => {
        render(
            <TestInterface
                sessionId="test-session-1"
                questions={mockQuestions}
                duration={10800}
                onTestComplete={mockOnTestComplete}
            />
        );

        // Verify timer is rendered with correct running state
        expect(screen.getByTestId('timer')).toBeInTheDocument();
        expect(screen.getByText('Timer Running: Yes')).toBeInTheDocument();
    });

    it('should load and display questions correctly', () => {
        render(
            <TestInterface
                sessionId="test-session-1"
                questions={mockQuestions}
                duration={10800}
                onTestComplete={mockOnTestComplete}
            />
        );

        // Verify all question options are rendered
        expect(screen.getByLabelText('3')).toBeInTheDocument();
        expect(screen.getByLabelText('4')).toBeInTheDocument();
        expect(screen.getByLabelText('5')).toBeInTheDocument();
    });

    it('should restore session state from localStorage on mount', () => {
        const savedState = {
            answers: { q1: 'b', q2: 'a' },
            markedForReview: { q1: true },
            questionTimes: { q1: 30 },
        };
        localStorage.setItem('test-session-test-session-1', JSON.stringify(savedState));

        render(
            <TestInterface
                sessionId="test-session-1"
                questions={mockQuestions}
                duration={10800}
                onTestComplete={mockOnTestComplete}
            />
        );

        // Check that answer is restored
        const selectedOption = screen.getByLabelText('4') as HTMLInputElement;
        expect(selectedOption.checked).toBe(true);

        // Check that mark for review is restored
        expect(screen.getByRole('button', { name: /unmark review/i })).toBeInTheDocument();
    });
});
