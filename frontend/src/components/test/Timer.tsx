import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';

interface TimerProps {
    initialSeconds: number;
    onTimeout: () => void;
    isRunning: boolean;
}

/**
 * Timer component with performance optimizations
 * Optimized with useMemo and useCallback
 */
const Timer: React.FC<TimerProps> = ({ initialSeconds, onTimeout, isRunning }) => {
    const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

    useEffect(() => {
        setRemainingSeconds(initialSeconds);
    }, [initialSeconds]);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, onTimeout]);

    const formatTime = useCallback((seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const timerColor = useMemo((): string => {
        const percentRemaining = (remainingSeconds / initialSeconds) * 100;
        if (percentRemaining <= 10) return '#d32f2f'; // Red
        if (percentRemaining <= 25) return '#f57c00'; // Orange
        return '#1976d2'; // Blue
    }, [remainingSeconds, initialSeconds]);

    const isWarning = useMemo(() => remainingSeconds <= initialSeconds * 0.1, [remainingSeconds, initialSeconds]);

    const formattedTime = useMemo(() => formatTime(remainingSeconds), [remainingSeconds, formatTime]);

    return (
        <Paper
            elevation={3}
            sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                backgroundColor: timerColor,
                color: 'white',
            }}
        >
            {isWarning ? <WarningIcon /> : <AccessTimeIcon />}
            <Box>
                <Typography variant="caption" display="block">
                    Time Remaining
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                    {formattedTime}
                </Typography>
            </Box>
        </Paper>
    );
};

export default React.memo(Timer);
