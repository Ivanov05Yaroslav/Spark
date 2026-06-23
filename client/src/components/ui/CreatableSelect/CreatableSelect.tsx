import { useState, useRef, useEffect } from 'react';
import styles from './CreatableSelect.module.css';
import ArrowIcon from '@/assets/arrowDown.svg?react';
import CloseIcon from '@/assets/close.svg?react';

export type SelectOption = {
    value: string;
    label: string;
};

export type CreatableSelectProps = {
    options: SelectOption[];
    value: string;
    onChange?: (value: string) => void;
    className?: string;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
};

export const CreatableSelect = ({
                                    options,
                                    value,
                                    onChange,
                                    className = '',
                                    placeholder = 'Оберіть модуль...',
                                    label,
                                    disabled = false
                                }: CreatableSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
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
        setIsCreating(false);
    };

    const handleCreateNewClick = () => {
        if (disabled) return;
        setIsCreating(true);
        setIsOpen(false);
        onChange?.('');
    };

    const handleCancelCreate = () => {
        if (disabled) return;
        setIsCreating(false);
        onChange?.('');
    };

    return (
        <div className={`${styles.wrapper} ${className} ${disabled ? styles.wrapperDisabled : ''}`}>
            {label && <label className={styles.label}>{label}</label>}

            <div
                ref={containerRef}
                className={`${styles.container} ${isOpen && !isCreating ? styles.containerOpen : ''}`}
            >
                {isCreating ? (
                    <div className={`${styles.inputContainer} ${disabled ? styles.inputContainerDisabled : ''}`}>
                        <input
                            type="text"
                            className={styles.inputTrigger}
                            value={value}
                            onChange={(e) => onChange?.(e.target.value)}
                            placeholder="Введіть назву нового модуля"
                            autoFocus
                            disabled={disabled}
                        />
                        <button
                            type="button"
                            className={styles.closeButton}
                            onClick={handleCancelCreate}
                            disabled={disabled}
                        >
                            <CloseIcon />
                        </button>
                    </div>
                ) : (
                    <>
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
                                {options.length > 0 && <div className={styles.divider} />}
                                <li
                                    className={`${styles.option} ${styles.createNewOption}`}
                                    onClick={handleCreateNewClick}
                                >
                                    + Створити нову
                                </li>
                            </ul>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};