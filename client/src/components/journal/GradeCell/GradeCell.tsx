import React, { useState, useRef, useEffect } from 'react';
import styles from './GradeCell.module.css';

interface GradeCellProps {
  id?: string;
  initialGrade?: string;
  isAttendance?: boolean;
  disabled?: boolean;
  onSave?: (newGrade: string) => void;
}

export const GradeCell: React.FC<GradeCellProps> = ({
  id,
  initialGrade = '',
  isAttendance,
  disabled,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [grade, setGrade] = useState(initialGrade);
  const inputRef = useRef<HTMLInputElement>(null);

  const originalGradeRef = useRef(initialGrade);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleCellClick = () => {
    if (disabled) return;

    if (isAttendance) {
      const newGrade = grade === 'Н' ? '' : 'Н';
      setGrade(newGrade);
      if (onSave) {
        onSave(newGrade);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    const trimmedGrade = grade.trim();
    setGrade(trimmedGrade);

    if (trimmedGrade !== originalGradeRef.current && onSave) {
      onSave(trimmedGrade);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setGrade(originalGradeRef.current);
      setIsEditing(false);
    }
  };

  const handleWrapperKeyDown = (e: React.KeyboardEvent) => {
    if (!isEditing && !disabled) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCellClick();
      }
    }
  };

  const isUnsaved = grade !== originalGradeRef.current;
  const isEmpty = grade === '';

  return (
    <div
      id={id}
      tabIndex={0}
      onKeyDown={handleWrapperKeyDown}
      className={`${styles.cellWrapper} ${isEmpty && !disabled ? styles.emptyWrapper : ''} ${disabled ? styles.disabledWrapper : ''}`}
      onClick={!isEditing ? handleCellClick : undefined}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className={styles.input}
          value={grade}
          onChange={(e) => setGrade(e.target.value.toUpperCase())}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="-"
        />
      ) : (
        <div className={styles.content}>
          {isEmpty ? (
            <span className={styles.emptyState}></span>
          ) : isUnsaved ? (
            <span className={`${styles.badge} ${styles.badgeUnsaved}`}>{grade}</span>
          ) : grade === 'Н' ? (
            <span className={`${styles.badge} ${styles.badgeAbsent}`}>{grade}</span>
          ) : (
            <span className={styles.textNormal}>{grade}</span>
          )}
        </div>
      )}
    </div>
  );
};
