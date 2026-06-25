import React from 'react';
import styles from './GradeInput.module.css';

interface GradeInputProps {
  value: string | number;
  onChange: (value: string) => void;
  maxGrade?: number;
  disabled?: boolean;
  label?: string;
}

export const GradeInput: React.FC<GradeInputProps> = ({
  value,
  onChange,
  maxGrade = 12,
  disabled = false,
  label = 'Оцінка:',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    if (val !== '' && Number(val) > maxGrade) {
      val = String(maxGrade);
    }

    if (val !== '' && Number(val) < 0) {
      val = '0';
    }

    onChange(val);
  };

  return (
    <div className={styles.container}>
      {label && <span className={styles.label}>{label}</span>}

      <div className={`${styles.inputWrapper} ${disabled ? styles.disabled : ''}`}>
        <input
          type="number"
          className={styles.input}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          min={0}
          max={maxGrade}
          placeholder="-"
        />
        <span className={styles.maxGradeText}>/ {maxGrade}</span>
      </div>
    </div>
  );
};
