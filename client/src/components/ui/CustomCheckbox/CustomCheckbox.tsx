import React from 'react';
import styles from './CustomCheckbox.module.css';
import CheckIcon from '@/assets/tick.svg?react';

interface CustomCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
                                                                  label,
                                                                  className,
                                                                  checked,
                                                                  disabled,
                                                                  ...props
                                                              }) => {
    return (
        <label className={`${styles.wrapper} ${disabled ? styles.disabled : ''} ${className || ''}`}>
            <input
                type="checkbox"
                className={styles.hiddenInput}
                checked={checked}
                disabled={disabled}
                {...props}
            />

            <div className={`${styles.checkbox} ${checked ? styles.checked : ''}`}>
                {checked && <CheckIcon className={styles.icon} />}
            </div>

            <span className={styles.label}>{label}</span>
        </label>
    );
};