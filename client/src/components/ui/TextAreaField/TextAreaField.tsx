import React, { useId } from 'react';
import styles from './TextAreaField.module.css';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextAreaField = ({ label, error, id, className, ...props }: TextAreaFieldProps) => {
  const generatedId = useId();
  const textAreaId = id || generatedId;

  return (
    <div className={`${styles.wrapper} ${className || ''}`}>
      {label && (
        <label htmlFor={textAreaId} className={styles.label}>
          {label}
        </label>
      )}

      <textarea
        id={textAreaId}
        className={`
                    ${styles.textarea} 
                    ${error ? styles.textareaError : ''}
                `}
        {...props}
      />

      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
