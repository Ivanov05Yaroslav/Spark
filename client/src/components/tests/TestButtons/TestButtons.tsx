import React from 'react';
import styles from './TestButtons.module.css';
import ArrowRightIcon from '@/assets/arrowRight.svg?react';
import ArrowLeftIcon from '@/assets/arrowLeft.svg?react';

export interface TestButtonsProps {
  onPrev: () => void;
  onNext: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
}

export const TestButtons: React.FC<TestButtonsProps> = ({
  onPrev,
  onNext,
  isFirstQuestion,
  isLastQuestion,
}) => {
  return (
    <div className={styles.navigationButtons}>
      {!isFirstQuestion ? (
        <button
          type="button"
          className={`${styles.buttonContainer} ${styles.leftButton}`}
          onClick={onPrev}
        >
          <ArrowLeftIcon className={styles.arrowIcon} />
          <p>Попереднє</p>
        </button>
      ) : (
        <div style={{ flex: 1 }} />
      )}

      <button
        type="button"
        className={`${styles.buttonContainer} ${styles.rightButton}`}
        onClick={onNext}
      >
        <p>
          {isLastQuestion ? (
            <strong style={{ fontWeight: 500 }}>Завершити тест</strong>
          ) : (
            'Наступне'
          )}
        </p>

        {!isLastQuestion && <ArrowRightIcon className={styles.arrowIcon} />}
      </button>
    </div>
  );
};
