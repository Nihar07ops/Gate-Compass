import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import * as fc from 'fast-check';
import Timer from './Timer';

// Feature: gate-compass, Property 16: Timer display accuracy
// Validates: Requirements 4.2

describe('Timer Property Tests', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('Property 16: Timer display accuracy - displayed time matches actual elapsed time subtracted from initial time', () => {
        fc.assert(
            fc.property(
                // Generate initial seconds between 1 and 10800 (3 hours)
                fc.integer({ min: 60, max: 10800 }),
                // Generate elapsed time that's less than initial time
                fc.integer({ min: 0, max: 100 }),
                (initialSeconds, elapsedSeconds) => {
                    // Ensure elapsed time doesn't exceed initial time
                    const actualElapsed = Math.min(elapsedSeconds, initialSeconds - 1);

                    const onTimeout = vi.fn();

                    // Render timer
                    const { unmount } = render(
                        <Timer
                            initialSeconds={initialSeconds}
                            onTimeout={onTimeout}
                            isRunning={true}
                        />
                    );

                    // Advance time by the elapsed seconds wrapped in act
                    act(() => {
                        vi.advanceTimersByTime(actualElapsed * 1000);
                    });

                    // Calculate expected remaining time
                    const expectedRemaining = initialSeconds - actualElapsed;

                    // Format expected time
                    const hours = Math.floor(expectedRemaining / 3600);
                    const minutes = Math.floor((expectedRemaining % 3600) / 60);
                    const secs = expectedRemaining % 60;
                    const expectedDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

                    // Get displayed time
                    const displayedTime = screen.getByText(expectedDisplay);

                    // Verify the displayed time matches expected
                    expect(displayedTime).toBeInTheDocument();

                    // Clean up this render
                    unmount();
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 16: Timer display accuracy - specific test for 3-hour timer (10800 seconds)', () => {
        fc.assert(
            fc.property(
                // Generate elapsed time for a 3-hour test
                fc.integer({ min: 0, max: 10799 }),
                (elapsedSeconds) => {
                    const initialSeconds = 10800; // 3 hours
                    const onTimeout = vi.fn();

                    // Render timer
                    const { unmount } = render(
                        <Timer
                            initialSeconds={initialSeconds}
                            onTimeout={onTimeout}
                            isRunning={true}
                        />
                    );

                    // Advance time by the elapsed seconds wrapped in act
                    act(() => {
                        vi.advanceTimersByTime(elapsedSeconds * 1000);
                    });

                    // Calculate expected remaining time
                    const expectedRemaining = initialSeconds - elapsedSeconds;

                    // Format expected time
                    const hours = Math.floor(expectedRemaining / 3600);
                    const minutes = Math.floor((expectedRemaining % 3600) / 60);
                    const secs = expectedRemaining % 60;
                    const expectedDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

                    // Get displayed time
                    const displayedTime = screen.getByText(expectedDisplay);

                    // Verify the displayed time matches expected
                    expect(displayedTime).toBeInTheDocument();

                    // Clean up this render
                    unmount();
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 16: Timer display accuracy - timer reaches zero and triggers timeout', () => {
        fc.assert(
            fc.property(
                // Generate initial seconds between 1 and 60 for faster testing
                fc.integer({ min: 1, max: 60 }),
                (initialSeconds) => {
                    const onTimeout = vi.fn();

                    // Render timer
                    const { unmount } = render(
                        <Timer
                            initialSeconds={initialSeconds}
                            onTimeout={onTimeout}
                            isRunning={true}
                        />
                    );

                    // Advance time to exactly when timer should expire wrapped in act
                    act(() => {
                        vi.advanceTimersByTime(initialSeconds * 1000);
                    });

                    // Verify timeout was called
                    expect(onTimeout).toHaveBeenCalled();

                    // Verify timer shows 00:00:00
                    const zeroTime = screen.getByText('00:00:00');
                    expect(zeroTime).toBeInTheDocument();

                    // Clean up this render
                    unmount();
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: gate-compass, Property 18: Timer continuity during navigation
    // Validates: Requirements 4.4
    it('Property 18: Timer continuity during navigation - timer continues without interruption during navigation', () => {
        fc.assert(
            fc.property(
                // Generate initial seconds between 60 and 10800 (1 minute to 3 hours)
                fc.integer({ min: 60, max: 10800 }),
                // Generate an array of navigation events (time intervals between navigations)
                fc.array(fc.integer({ min: 1, max: 30 }), { minLength: 1, maxLength: 10 }),
                (initialSeconds, navigationIntervals) => {
                    const onTimeout = vi.fn();

                    // Render timer
                    const { unmount, rerender } = render(
                        <Timer
                            initialSeconds={initialSeconds}
                            onTimeout={onTimeout}
                            isRunning={true}
                        />
                    );

                    let totalElapsed = 0;

                    // Simulate navigation events by advancing time and re-rendering
                    for (const interval of navigationIntervals) {
                        // Ensure we don't exceed the initial time
                        if (totalElapsed + interval >= initialSeconds) {
                            break;
                        }

                        // Advance time (simulating time passing before navigation)
                        act(() => {
                            vi.advanceTimersByTime(interval * 1000);
                        });

                        totalElapsed += interval;

                        // Simulate navigation by re-rendering with same props
                        // (in real app, parent component re-renders but timer props stay same)
                        rerender(
                            <Timer
                                initialSeconds={initialSeconds}
                                onTimeout={onTimeout}
                                isRunning={true}
                            />
                        );
                    }

                    // Calculate expected remaining time
                    const expectedRemaining = initialSeconds - totalElapsed;

                    // Format expected time
                    const hours = Math.floor(expectedRemaining / 3600);
                    const minutes = Math.floor((expectedRemaining % 3600) / 60);
                    const secs = expectedRemaining % 60;
                    const expectedDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

                    // Verify the timer shows the correct time after all navigations
                    const displayedTime = screen.getByText(expectedDisplay);
                    expect(displayedTime).toBeInTheDocument();

                    // Verify timeout was not called (since we didn't reach zero)
                    expect(onTimeout).not.toHaveBeenCalled();

                    // Clean up
                    unmount();
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 18: Timer continuity during navigation - timer state is not reset by navigation', () => {
        fc.assert(
            fc.property(
                // Generate initial seconds
                fc.integer({ min: 100, max: 1000 }),
                // Generate time before first navigation
                fc.integer({ min: 10, max: 50 }),
                // Generate time before second navigation
                fc.integer({ min: 10, max: 50 }),
                (initialSeconds, time1, time2) => {
                    const onTimeout = vi.fn();

                    // Render timer
                    const { unmount, rerender } = render(
                        <Timer
                            initialSeconds={initialSeconds}
                            onTimeout={onTimeout}
                            isRunning={true}
                        />
                    );

                    // Advance time before first navigation
                    act(() => {
                        vi.advanceTimersByTime(time1 * 1000);
                    });

                    const afterFirstInterval = initialSeconds - time1;

                    // Simulate first navigation
                    rerender(
                        <Timer
                            initialSeconds={initialSeconds}
                            onTimeout={onTimeout}
                            isRunning={true}
                        />
                    );

                    // Advance time before second navigation
                    act(() => {
                        vi.advanceTimersByTime(time2 * 1000);
                    });

                    const afterSecondInterval = afterFirstInterval - time2;

                    // Simulate second navigation
                    rerender(
                        <Timer
                            initialSeconds={initialSeconds}
                            onTimeout={onTimeout}
                            isRunning={true}
                        />
                    );

                    // Format expected time after both navigations
                    const hours = Math.floor(afterSecondInterval / 3600);
                    const minutes = Math.floor((afterSecondInterval % 3600) / 60);
                    const secs = afterSecondInterval % 60;
                    const expectedDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

                    // Verify the timer continues from where it was, not reset
                    const displayedTime = screen.getByText(expectedDisplay);
                    expect(displayedTime).toBeInTheDocument();

                    // Clean up
                    unmount();
                }
            ),
            { numRuns: 100 }
        );
    });
});
