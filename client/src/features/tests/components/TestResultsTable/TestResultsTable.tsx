import React from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { SecondaryButton } from '@/components/ui/SecondaryButton/SecondaryButton';
import styles from './TestResultsTable.module.css';

export interface TestAttempt {
  id: string;
  number: number;
  duration: string;
  correctAnswers: number | null;
  wrongAnswers: number | null;
  completionDate: string;
  mark: string;
  hasDetails: boolean;
}

interface Props {
  attempts: TestAttempt[];
  onViewDetails: (id: string) => void;
}

export const TestResultsTable: React.FC<Props> = ({ attempts, onViewDetails }) => {
  return (
    <ContentCard title="Спроби">
      {attempts.length === 0 ? (
        <div className={styles.emptyState}>Спроб ще не було</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thNumber}>№</th>
                <th className={styles.thDuration}>Тривалість</th>
                <th className={styles.thCorrect}>Правильні відповіді</th>
                <th className={styles.thWrong}>Неправильні відповіді</th>
                <th className={styles.thDate}>Дата проходження</th>
                <th className={styles.thMark}>Оцінка</th>
                <th className={styles.thAction}></th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt.id} className={styles.tableRow}>
                  <td className={styles.tdNumber}>{attempt.number}</td>
                  <td className={styles.tdDuration}>{attempt.duration}</td>
                  <td className={styles.tdCorrect}>{attempt.correctAnswers ?? '-'}</td>
                  <td className={styles.tdWrong}>{attempt.wrongAnswers ?? '-'}</td>
                  <td className={styles.tdDate}>{attempt.completionDate}</td>
                  <td className={styles.tdMark}>
                    {attempt.mark !== null ? (
                      <span className={styles.markBadge}>{attempt.mark}</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className={styles.tdAction}>
                    {attempt.hasDetails && (
                      <SecondaryButton
                        onClick={() => onViewDetails(attempt.id)}
                        variantColor="default"
                        className={styles.overviewBtn}
                      >
                        Переглянути
                      </SecondaryButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ContentCard>
  );
};
