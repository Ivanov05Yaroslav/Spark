import React from 'react';
import styles from './ThemeColorPicker.module.css';

export interface ThemeColor {
    value: string;
    base: string;
}

export const DEFAULT_THEME_COLORS: ThemeColor[] = [
    { value: 'purple', base: '#B88BFF' },
    { value: 'pink', base: '#D6709E' },
    { value: 'green', base: '#70A97A' },
    { value: 'peach', base: '#E38859' },
    { value: 'blue', base: '#7C93FF' },
    { value: 'gray', base: '#9A9A9A' },
    { value: 'red', base: '#E06D6D' },
    { value: 'yellow', base: '#E5C247' },
    { value: 'teal', base: '#5EB496' },
];

interface ThemeColorPickerProps {
    label?: string;
    colors?: ThemeColor[];
    selectedColor: string;
    onChange: (colorValue: string) => void;
}

export const ThemeColorPicker = ({
                                     label = 'Колір теми',
                                     colors = DEFAULT_THEME_COLORS,
                                     selectedColor,
                                     onChange
                                 }: ThemeColorPickerProps) => {
    return (
        <div className={styles.container}>
            {label && <span className={styles.label}>{label}</span>}

            <div className={styles.swatchList} role="radiogroup" aria-label={label}>
                {colors.map((color) => {
                    const isSelected = selectedColor === color.value;

                    return (
                        <button
                            key={color.value}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            className={styles.swatch}
                            style={{
                                backgroundColor: `${color.base}33`,
                                borderColor: color.base
                            }}
                            onClick={() => onChange(color.value)}
                            aria-label={`Select color ${color.value}`}
                        >
                            {isSelected && (
                                <svg
                                    className={styles.checkIcon}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke={color.base}
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M20 6L9 17L4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};