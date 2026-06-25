import React, { useId } from 'react';
import styles from './FullNameInput.module.css';

interface FullNameInputProps {
  label?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onMiddleNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const FullNameInput: React.FC<FullNameInputProps> = ({
  label = 'ПІБ',
  firstName,
  middleName,
  lastName,
  onFirstNameChange,
  onMiddleNameChange,
  onLastNameChange,
  error,
  disabled = false,
  className = '',
}) => {
  const idPrefix = useId();

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}

      <div className={styles.inputsRow}>
        <input
          id={`${idPrefix}-last`}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          placeholder="Прізвище"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          disabled={disabled}
        />
        <input
          id={`${idPrefix}-first`}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          placeholder="Ім'я"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          disabled={disabled}
        />
        <input
          id={`${idPrefix}-middle`}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          placeholder="По батькові"
          value={middleName}
          onChange={(e) => onMiddleNameChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
