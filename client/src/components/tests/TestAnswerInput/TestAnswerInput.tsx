import React from 'react';
import { Input } from '@/components/ui/Input/Input';
import styles from './TestAnswerInput.module.css';

import TickIcon from '@/assets/testTick.svg?react';
import CrossIcon from '@/assets/testCross.svg?react';
import DeleteIcon from '@/assets/delete.svg?react';

interface TestAnswerInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isCorrect: boolean;
  onToggleCorrect: () => void;
  onDelete?: () => void;
}

export const TestAnswerInput: React.FC<TestAnswerInputProps> = ({
  label,
  placeholder = 'Введіть варіант відповіді',
  value,
  onChange,
  isCorrect,
  onToggleCorrect,
  onDelete,
}) => {
  return (
    <div className={styles.answerWrapper}>
      <div className={styles.inputContainer}>
        <Input
          label={label}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={styles.customInput}
        />

        <button
          type="button"
          className={styles.statusButton}
          onClick={onToggleCorrect}
          aria-label={isCorrect ? 'Позначити як неправильну' : 'Позначити як правильну'}
        >
          {isCorrect ? <TickIcon className={styles.icon} /> : <CrossIcon className={styles.icon} />}
        </button>
      </div>

      {onDelete && (
        <button
          type="button"
          className={styles.deleteButton}
          onClick={onDelete}
          aria-label="Видалити варіант"
          title="Видалити варіант"
        >
          <DeleteIcon className={styles.deleteIcon} />
        </button>
      )}
    </div>
  );
};
