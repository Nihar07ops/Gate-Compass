/**
 * Session recovery utilities for handling browser crashes and page refreshes
 */

export interface TestSessionState {
    sessionId: string;
    testId: string;
    currentQuestionIndex: number;
    answers: Record<string, string>;
    markedForReview: Set<string>;
    questionTimes: Record<string, number>;
    startTime: number;
    lastSaved: number;
}

const SESSION_STORAGE_KEY = 'gate_compass_test_session';
const SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Save test session state to localStorage
 */
export const saveSessionState = (state: TestSessionState): void => {
    try {
        const stateToSave = {
            ...state,
            markedForReview: Array.from(state.markedForReview),
            lastSaved: Date.now(),
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
        console.error('Failed to save session state:', error);
    }
};

/**
 * Load test session state from localStorage
 */
export const loadSessionState = (sessionId: string): TestSessionState | null => {
    try {
        const savedState = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!savedState) {
            return null;
        }

        const parsed = JSON.parse(savedState);

        // Check if session matches
        if (parsed.sessionId !== sessionId) {
            return null;
        }

        // Check if session has expired
        const now = Date.now();
        if (now - parsed.lastSaved > SESSION_TIMEOUT) {
            clearSessionState();
            return null;
        }

        // Reconstruct Set from array
        return {
            ...parsed,
            markedForReview: new Set(parsed.markedForReview),
        };
    } catch (error) {
        console.error('Failed to load session state:', error);
        return null;
    }
};

/**
 * Clear session state from localStorage
 */
export const clearSessionState = (): void => {
    try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear session state:', error);
    }
};

/**
 * Check if there's a recoverable session
 */
export const hasRecoverableSession = (): boolean => {
    try {
        const savedState = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!savedState) {
            return false;
        }

        const parsed = JSON.parse(savedState);
        const now = Date.now();

        return now - parsed.lastSaved <= SESSION_TIMEOUT;
    } catch (error) {
        return false;
    }
};

/**
 * Get session ID from recoverable session
 */
export const getRecoverableSessionId = (): string | null => {
    try {
        const savedState = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!savedState) {
            return null;
        }

        const parsed = JSON.parse(savedState);
        const now = Date.now();

        if (now - parsed.lastSaved > SESSION_TIMEOUT) {
            return null;
        }

        return parsed.sessionId;
    } catch (error) {
        return null;
    }
};
