import React, { useRef } from 'react';
import TrashIcon from '../../../../../assets/delete.svg?react'; // Переконайся, що шлях правильний
import styles from './ChildCodeInput.module.css';

interface OTPParentInputProps {
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
    label?: string;
    onRemove?: () => void;
}

export const ChildCodeInput: React.FC<OTPParentInputProps> = ({
                                                                  value,
                                                                  onChange,
                                                                  disabled,
                                                                  label,
                                                                  onRemove
                                                              }) => {
    const length = 6;
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        if (!val && e.target.value !== '') return;

        const char = val.slice(-1);
        const valueArray = value.split('');

        for (let i = 0; i < length; i++) {
            if (!valueArray[i]) valueArray[i] = '';
        }

        valueArray[index] = char;
        const newValue = valueArray.join('');

        onChange(newValue);

        if (char && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, length);

        onChange(pastedData);

        const focusIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    return (
        <div className={styles.container}>
            {label && <span className={styles.label}>{label}</span>}

            <div className={styles.row}>
                <div className={styles.otpFieldGroup}>
                    {Array.from({ length }).map((_, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            maxLength={1}
                            disabled={disabled}
                            className={styles.otpBox}
                            value={value[index] || ''}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={handlePaste}
                        />
                    ))}
                </div>

                {onRemove && (
                    <button
                        type="button"
                        className={styles.removeButton}
                        onClick={onRemove}
                        disabled={disabled}
                    >
                        <TrashIcon className={styles.trashIcon} />
                    </button>
                )}
            </div>
        </div>
    );
};