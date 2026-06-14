import React, { useRef } from 'react';
import styles from './OTPInput.module.css';

interface OTPInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
}

export const OTPInput = ({ length = 6, value, onChange }: OTPInputProps) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const val = e.target.value.replace(/\D/g, '');
        if (!val && e.target.value !== '') return;

        const char = val.slice(-1);
        const valueArray = value.split('');
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
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

        onChange(pastedData);

        const focusIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    return (
        <div className={styles.container}>
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={styles.input}
                    value={value[index] || ''}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                />
            ))}
        </div>
    );
};