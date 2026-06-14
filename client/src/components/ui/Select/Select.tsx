import { useState, useRef, useEffect } from 'react';
import styles from './Select.module.css';
import ArrowIcon from '@/assets/arrowDown.svg?react';

export type SelectOption = {
    value: string;
    label: string;
};

export type SelectProps = {
    options: SelectOption[];
    value: string;
    onChange?: (value: string) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
};

export const Select = ({
                           options,
                           value,
                           onChange,
                           className = '',
                           placeholder = 'Select...',
                           disabled = false
                       }: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOptionClick = (optionValue: string) => {
        onChange?.(optionValue);
        setIsOpen(false);
    };

    return (
        <div
            ref={containerRef}
            className={`${styles.container} ${isOpen ? styles.containerOpen : ''} ${className}`}
        >
            <button
                type="button"
                className={`${styles.trigger} ${disabled ? styles.triggerDisabled : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                <span className={!selectedOption ? styles.placeholderText : ''}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>

                <ArrowIcon className={styles.arrow} />
            </button>

            {isOpen && !disabled && (
                <ul className={styles.dropdown}>
                    {options.map((option) => {
                        const isActive = option.value === value;
                        return (
                            <li
                                key={option.value}
                                className={`${styles.option} ${isActive ? styles.optionActive : ''}`}
                                onClick={() => handleOptionClick(option.value)}
                            >
                                {option.label}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};