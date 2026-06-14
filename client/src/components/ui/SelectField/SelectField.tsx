import React, { useId } from 'react';
import { Select, SelectProps } from '@/components/ui/Select/Select';
import styles from './SelectField.module.css';

interface SelectFieldProps extends SelectProps {
    label?: string;
    error?: string;
    id?: string;
}

export const SelectField = ({
                                label,
                                error,
                                className = '',
                                id,
                                ...selectProps
                            }: SelectFieldProps) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
        <div className={`${styles.fieldWrapper} ${className}`}>
            {label && (
                <label htmlFor={selectId} className={styles.label}>
                    {label}
                </label>
            )}

            <Select
                {...selectProps}
                className={error ? styles.selectError : ''}
            />

            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
};