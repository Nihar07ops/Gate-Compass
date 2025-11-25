import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Timer from './Timer';

describe('Timer Component - Unit Tests', () => {
    it('should display initial time correctly formatted', () => {
        const onTimeout = vi.fn();
        render(<Timer initialSeconds={10800} onTimeout={onTimeout} isRunning={true} />);

        expect(screen.getByText('03:00:00')).toBeInTheDocument();
    });

    it('should display time remaining label', () => {
        const onTimeout = vi.fn();
        render(<Timer initialSeconds={10800} onTimeout={onTimeout} isRunning={true} />);

        expect(screen.getByText('Time Remaining')).toBeInTheDocument();
    });

    it('should not countdown when isRunning is false', () => {
        const onTimeout = vi.fn();
        render(<Timer initialSeconds={10} onTimeout={onTimeout} isRunning={false} />);

        expect(screen.getByText('00:00:10')).toBeInTheDocument();

        // Timer should remain at initial value when not running
        expect(onTimeout).not.toHaveBeenCalled();
    });

    it('should format time correctly for different durations', () => {
        const onTimeout = vi.fn();

        // Test 3 hours
        const { rerender } = render(
            <Timer initialSeconds={10800} onTimeout={onTimeout} isRunning={false} />
        );
        expect(screen.getByText('03:00:00')).toBeInTheDocument();

        // Test 1 hour 30 minutes
        rerender(<Timer initialSeconds={5400} onTimeout={onTimeout} isRunning={false} />);
        expect(screen.getByText('01:30:00')).toBeInTheDocument();

        // Test 45 minutes
        rerender(<Timer initialSeconds={2700} onTimeout={onTimeout} isRunning={false} />);
        expect(screen.getByText('00:45:00')).toBeInTheDocument();

        // Test 1 minute 30 seconds
        rerender(<Timer initialSeconds={90} onTimeout={onTimeout} isRunning={false} />);
        expect(screen.getByText('00:01:30')).toBeInTheDocument();
    });

    it('should format single digit values with leading zeros', () => {
        const onTimeout = vi.fn();

        // Test 5 seconds
        render(<Timer initialSeconds={5} onTimeout={onTimeout} isRunning={false} />);
        expect(screen.getByText('00:00:05')).toBeInTheDocument();
    });

    it('should update display when initialSeconds prop changes', () => {
        const onTimeout = vi.fn();
        const { rerender } = render(
            <Timer initialSeconds={100} onTimeout={onTimeout} isRunning={false} />
        );

        expect(screen.getByText('00:01:40')).toBeInTheDocument();

        // Change initialSeconds
        rerender(<Timer initialSeconds={200} onTimeout={onTimeout} isRunning={false} />);

        expect(screen.getByText('00:03:20')).toBeInTheDocument();
    });

    it('should render with correct initial state', () => {
        const onTimeout = vi.fn();
        const { container } = render(
            <Timer initialSeconds={10800} onTimeout={onTimeout} isRunning={true} />
        );

        // Should render a Paper component
        expect(container.querySelector('.MuiPaper-root')).toBeInTheDocument();
    });

    it('should display zero time correctly', () => {
        const onTimeout = vi.fn();
        render(<Timer initialSeconds={0} onTimeout={onTimeout} isRunning={false} />);

        expect(screen.getByText('00:00:00')).toBeInTheDocument();
    });
});
