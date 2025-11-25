import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ResultsPage from './ResultsPage';
import axios from 'axios';
import React from 'react';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

// Mock the chart components to avoid canvas issues in tests
vi.mock('react-chartjs-2', () => ({
    Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('ResultsPage', () => {
    const mockAnalysis = {
        result: {
            id: 'result-1',
            session_id: 'session-1',
            user_id: 'user-1',
            score: 15,
            total_questions: 20,
            correct_answers: 15,
            incorrect_answers: 4,
            unanswered: 1,
            percentage: 75.0,
            concept_performance: [
                {
                    concept_id: 'concept-1',
                    concept_name: 'Data Structures',
                    total_questions: 10,
                    correct_answers: 8,
                    accuracy: 0.8,
                    average_time_per_question: 120,
                },
                {
                    concept_id: 'concept-2',
                    concept_name: 'Algorithms',
                    total_questions: 10,
                    correct_answers: 7,
                    accuracy: 0.7,
                    average_time_per_question: 150,
                },
            ],
            feedback: {
                overall_message: 'Good performance! Keep practicing.',
                strengths: ['Data Structures', 'Problem Solving'],
                weaknesses: [
                    {
                        concept_name: 'Algorithms',
                        accuracy: 0.7,
                        questions_attempted: 10,
                    },
                ],
                recommendations: [
                    {
                        concept_name: 'Algorithms',
                        textbook_chapters: ['Chapter 5: Sorting', 'Chapter 6: Searching'],
                        practice_topics: ['Quick Sort', 'Binary Search'],
                        priority: 'high' as const,
                    },
                ],
            },
            created_at: '2024-01-15T10:00:00Z',
        },
        session: {
            id: 'session-1',
            start_time: '2024-01-15T07:00:00Z',
            end_time: '2024-01-15T10:00:00Z',
            total_time_spent: 10800,
            status: 'completed',
        },
        questions: [
            {
                question_id: 'q1',
                content: 'What is a binary tree?',
                options: [
                    { id: 'a', text: 'Option A' },
                    { id: 'b', text: 'Option B' },
                ],
                user_answer: 'a',
                correct_answer: 'a',
                explanation: 'A binary tree is...',
                is_correct: true,
                time_spent: 120,
                marked_for_review: false,
                concept: 'Data Structures',
                difficulty: 'medium',
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
    });

    it('displays score correctly', async () => {
        mockedAxios.get.mockResolvedValue({ data: { analysis: mockAnalysis } });

        render(
            <MemoryRouter initialEntries={['/results/session-1']}>
                <Routes>
                    <Route path="/results/:sessionId" element={<ResultsPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('75.0%')).toBeInTheDocument();
        });

        expect(screen.getByText(/Score: 15 \/ 20/i)).toBeInTheDocument();
    });

    it('displays correct answers count', async () => {
        mockedAxios.get.mockResolvedValue({ data: { analysis: mockAnalysis } });

        render(
            <MemoryRouter initialEntries={['/results/session-1']}>
                <Routes>
                    <Route path="/results/:sessionId" element={<ResultsPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('75.0%')).toBeInTheDocument();
        });

        // Check that correct answers section exists with the count
        const correctSection = screen.getAllByText('Correct');
        expect(correctSection.length).toBeGreaterThan(0);
        expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('displays incorrect answers count', async () => {
        mockedAxios.get.mockResolvedValue({ data: { analysis: mockAnalysis } });

        render(
            <MemoryRouter initialEntries={['/results/session-1']}>
                <Routes>
                    <Route path="/results/:sessionId" element={<ResultsPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('4')).toBeInTheDocument();
        });

        expect(screen.getByText('Incorrect')).toBeInTheDocument();
    });

    it('displays unanswered count', async () => {
        mockedAxios.get.mockResolvedValue({ data: { analysis: mockAnalysis } });

        render(
            <MemoryRouter initialEntries={['/results/session-1']}>
                <Routes>
                    <Route path="/results/:sessionId" element={<ResultsPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('1')).toBeInTheDocument();
        });

        expect(screen.getByText('Unanswered')).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
        mockedAxios.get.mockImplementation(() => new Promise(() => { }));

        render(
            <MemoryRouter initialEntries={['/results/session-1']}>
                <Routes>
                    <Route path="/results/:sessionId" element={<ResultsPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('displays error message when fetch fails', async () => {
        mockedAxios.get.mockRejectedValue({
            response: { data: { error: 'Failed to load results' } },
        });

        render(
            <MemoryRouter initialEntries={['/results/session-1']}>
                <Routes>
                    <Route path="/results/:sessionId" element={<ResultsPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Failed to load results')).toBeInTheDocument();
        });
    });
});
