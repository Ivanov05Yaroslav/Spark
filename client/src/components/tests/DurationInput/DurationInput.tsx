import React, { useId } from 'react';
import styles from './DurationInput.module.css';

interface DurationInputProps {
    label?: string;
    hours: string;
    minutes: string;
    onHoursChange: (value: string) => void;
    onMinutesChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
    className?: string;
}

export const DurationInput: React.FC<DurationInputProps> = ({
                                                                label = "Тривалість",
                                                                hours,
                                                                minutes,
                                                                onHoursChange,
                                                                onMinutesChange,
                                                                error,
                                                                disabled = false,
                                                                className = '',
                                                            }) => {
    const idPrefix = useId();

    return (
        <div className={`${styles.wrapper} ${className}`}>
            {label && (
                <label className={styles.label}>
                    {label}
                </label>
            )}

            <div className={styles.inputsRow}>
                <input
                    id={`${idPrefix}-hours`}
                    className={`${styles.input} ${error ? styles.inputError : ''}`}
                    placeholder="Години"
                    value={hours}
                    onChange={(e) => onHoursChange(e.target.value)}
                    disabled={disabled}
                    type="number"
                    min="0"
                />
                <input
                    id={`${idPrefix}-minutes`}
                    className={`${styles.input} ${error ? styles.inputError : ''}`}
                    placeholder="Хвилини"
                    value={minutes}
                    onChange={(e) => onMinutesChange(e.target.value)}
                    disabled={disabled}
                    type="number"
                    min="0"
                    max="59"
                />
            </div>

            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
};