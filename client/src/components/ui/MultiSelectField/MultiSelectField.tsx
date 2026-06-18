import React, { useState, useRef, useEffect, useId } from 'react';
import styles from './MultiSelectField.module.css';
import ArrowIcon from '@/assets/arrowDown.svg?react';
import CheckIcon from '@/assets/whiteTick.svg?react';

interface Option {
    value: string;
    label: string;
}

interface MultiSelectFieldProps {
    label?: string;
    options: Option[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    id?: string;
}

export const MultiSelectField = ({
                                     label,
                                     options,
                                     value,
                                     onChange,
                                     placeholder = 'Select options',
                                     disabled = false,
                                     error,
                                     id
                                 }: MultiSelectFieldProps) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleToggle = () => {
        if (!disabled) setIsOpen(!isOpen);
    };

    const handleOptionClick = (optionValue: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (value.includes(optionValue)) {
            onChange(value.filter((v) => v !== optionValue));
        } else {
            onChange([...value, optionValue]);
        }
    };

    const selectedLabels = options
        .filter((opt) => value.includes(opt.value))
        .map((opt) => opt.label);

    const displayText = selectedLabels.length > 0
        ? selectedLabels.join(', ')
        : placeholder;

    return (
        <div className={styles.fieldWrapper} ref={dropdownRef}>
            {label && (
                <label htmlFor={selectId} className={styles.label}>
                    {label}
                </label>
            )}

            <div
                id={selectId}
                className={`
                    ${styles.trigger} 
                    ${isOpen ? styles.triggerActive : ''} 
                    ${disabled ? styles.triggerDisabled : ''}
                    ${error ? styles.triggerError : ''}
                `}
                onClick={handleToggle}
            >
                <span className={selectedLabels.length > 0 ? styles.textSelected : styles.textPlaceholder}>
                    {displayText}
                </span>

                <ArrowIcon className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`} />
            </div>

            {isOpen && (
                <div className={styles.dropdown}>
                    {options.length === 0 ? (
                        <div className={styles.empty}>No options available</div>
                    ) : (
                        options.map((option) => {
                            const isSelected = value.includes(option.value);
                            return (
                                <div
                                    key={option.value}
                                    className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                                    onClick={(e) => handleOptionClick(option.value, e)}
                                >
                                    <div className={`${styles.checkbox} ${isSelected ? styles.checkboxChecked : ''}`}>
                                        {isSelected && (
                                            <CheckIcon className={styles.checkIcon} />
                                        )}
                                    </div>
                                    <span className={styles.optionLabel}>{option.label}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
};