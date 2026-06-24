import React from 'react';
import styles from './TestAnswerItem.module.css';
import CheckIcon from '@/assets/tick.svg?react';

export interface TestAnswerItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: string;
    type?: 'checkbox' | 'radio';
}

export const TestAnswerItem: React.FC<TestAnswerItemProps> = ({
                                                                  label,
                                                                  type = 'radio',
                                                                  className,
                                                                  checked,
                                                                  disabled,
                                                                  ...props
                                                              }) => {
    return (
        <label className={`${styles.wrapper} ${disabled ? styles.disabled : ''} ${className || ''}`}>
            <input
                type={type}
                className={styles.hiddenInput}
                checked={checked}
                disabled={disabled}
                {...props}
            />

            <div className={`${styles.control} ${styles[type]} ${checked ? styles.checked : ''}`}>
                {checked && type === 'checkbox' && <CheckIcon className={styles.icon} />}
                {checked && type === 'radio' && <div className={styles.radioDot} />}
            </div>

            <div className={`${styles.textContainer} ${checked ? styles.textContainerChecked : ''}`}>
                {label}
            </div>
        </label>
    );
};