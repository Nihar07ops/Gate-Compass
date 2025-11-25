import { useEffect, useRef } from 'react';

interface QuestionTrackerProps {
    questionId: string;
    onTimeUpdate: (questionId: string, timeSpent: number) => void;
    isActive: boolean;
}

const QuestionTracker: React.FC<QuestionTrackerProps> = ({
    questionId,
    onTimeUpdate,
    isActive,
}) => {
    const startTimeRef = useRef<number>(Date.now());
    const accumulatedTimeRef = useRef<number>(0);

    useEffect(() => {
        if (isActive) {
            startTimeRef.current = Date.now();
        } else {
            // When becoming inactive, accumulate the time spent
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
            accumulatedTimeRef.current += timeSpent;
        }
    }, [isActive]);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            const currentTimeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const totalTime = accumulatedTimeRef.current + currentTimeSpent;
            onTimeUpdate(questionId, totalTime);
        }, 1000);

        return () => clearInterval(interval);
    }, [questionId, onTimeUpdate, isActive]);

    // Cleanup on unmount or question change
    useEffect(() => {
        return () => {
            if (isActive) {
                const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
                const totalTime = accumulatedTimeRef.current + timeSpent;
                onTimeUpdate(questionId, totalTime);
            }
        };
    }, [questionId, onTimeUpdate, isActive]);

    return null; // This component doesn't render anything
};

export default QuestionTracker;
