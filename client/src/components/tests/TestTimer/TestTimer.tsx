import React, { useState, useEffect } from 'react';
import styles from './TestTimer.module.css';

interface TestTimerProps {
    initialTimeInSeconds: number;
    onTimeUp: () => void;
    className?: string;
}

export const TestTimer: React.FC<TestTimerProps> = ({
                                                        initialTimeInSeconds,
                                                        onTimeUp,
                                                        className = ''
                                                    }) => {
    const [timeLeft, setTimeLeft] = useState(initialTimeInSeconds);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timerId);
                    onTimeUp();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [onTimeUp]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h} год ${m} хв ${s} сек`;
        }
        return `${m} хв ${s} сек`;
    };

    return (
        <div className={`${styles.container} ${className}`}>
            <span className={styles.text}>
                Залишилось часу: <span className={styles.timeValue}>{formatTime(timeLeft)}</span>
            </span>
        </div>
    );
};