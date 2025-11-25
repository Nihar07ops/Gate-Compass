import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConceptAnalysis from './ConceptAnalysis';
import React from 'react';

// Mock the chart components to avoid canvas issues in tests
vi.mock('react-chartjs-2', () => ({
    Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
}));

describe('ConceptAnalysis', () => {
    const mockConceptPerformance = [
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
            total_questions: 8,
            correct_answers: 5,
            accuracy: 0.625,
            average_time_per_question: 150,
        },
        {
            concept_id: 'concept-3',
            concept_name: 'Operating Systems',
            total_questions: 5,
            correct_answers: 2,
            accuracy: 0.4,
            average_time_per_question: 180,
        },
    ];

    it('calculates and displays concept performance correctly', () => {
        render(<ConceptAnalysis conceptPerformance={mockConceptPerformance} />);

        // Check that all concepts are displayed
        expect(screen.getByText('Data Structures')).toBeInTheDocument();
        expect(screen.getByText('Algorithms')).toBeInTheDocument();
        expect(screen.getByText('Operating Systems')).toBeInTheDocument();

        // Check accuracy percentages are calculated correctly
        expect(screen.getByText('80.0%')).toBeInTheDocument();
        expect(screen.getByText('62.5%')).toBeInTheDocument();
        expect(screen.getByText('40.0%')).toBeInTheDocument();
    });

    it('displays total questions for each concept', () => {
        render(<ConceptAnalysis conceptPerformance={mockConceptPerformance} />);

        // Check total questions
        const cells = screen.getAllByRole('cell');
        const totalQuestionsCells = cells.filter(cell =>
            cell.textContent === '10' || cell.textContent === '8' || cell.textContent === '5'
        );

        expect(totalQuestionsCells.length).toBeGreaterThan(0);
    });

    it('displays correct answers for each concept', () => {
        render(<ConceptAnalysis conceptPerformance={mockConceptPerformance} />);

        // Check correct answers
        const cells = screen.getAllByRole('cell');
        const correctAnswersCells = cells.filter(cell =>
            cell.textContent === '8' || cell.textContent === '5' || cell.textContent === '2'
        );

        expect(correctAnswersCells.length).toBeGreaterThan(0);
    });

    it('displays average time per question', () => {
        render(<ConceptAnalysis conceptPerformance={mockConceptPerformance} />);

        // Check formatted times (120s = 2:00, 150s = 2:30, 180s = 3:00)
        expect(screen.getByText('2:00')).toBeInTheDocument();
        expect(screen.getByText('2:30')).toBeInTheDocument();
        expect(screen.getByText('3:00')).toBeInTheDocument();
    });

    it('renders the bar chart', () => {
        render(<ConceptAnalysis conceptPerformance={mockConceptPerformance} />);

        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('displays the component title', () => {
        render(<ConceptAnalysis conceptPerformance={mockConceptPerformance} />);

        expect(screen.getByText('Concept-wise Performance')).toBeInTheDocument();
    });

    it('handles empty concept performance array', () => {
        render(<ConceptAnalysis conceptPerformance={[]} />);

        expect(screen.getByText('Concept-wise Performance')).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('displays accuracy with progress bars', () => {
        render(<ConceptAnalysis conceptPerformance={mockConceptPerformance} />);

        // Check that progress bars are rendered (LinearProgress components)
        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars.length).toBe(mockConceptPerformance.length);
    });
});
