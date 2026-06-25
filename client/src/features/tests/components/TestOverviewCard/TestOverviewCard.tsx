import React from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { InfoItem } from '@/components/ui/InfoItem/InfoItem.tsx';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton.tsx';
import styles from './TestOverviewCard.module.css';
import ClockIcon from '@/assets/clock.svg?react';
import HashIcon from '@/assets/hash.svg?react';
import HelpIcon from '@/assets/questionMark.svg?react';
import CalendarIcon from '@/assets/calendar.svg?react';

interface Props {
  duration: string;
  attemptsAllowed: number;
  questionsCount: number;
  dueDate: string;
  onStart: () => void;
}

export const TestOverviewCard: React.FC<Props> = ({
  duration,
  attemptsAllowed,
  questionsCount,
  dueDate,
  onStart,
}) => {
  return (
    <ContentCard title="Деталі тесту">
      <div className={styles.container}>
        <div className={styles.infoList}>
          <InfoItem icon={ClockIcon} title="Тривалість" subtitle={duration} />
          <InfoItem icon={HashIcon} title="Кількість спроб" subtitle={String(attemptsAllowed)} />
          <InfoItem icon={HelpIcon} title="Кількість питань" subtitle={String(questionsCount)} />
          <InfoItem
            icon={CalendarIcon}
            title="Термін виконання"
            subtitle={dueDate}
            className={styles.purpleIconItem}
          />
        </div>

        <PrimaryButton onClick={onStart} style={{ marginTop: '24px', width: '100%' }}>
          РОЗПОЧАТИ ТЕСТ
        </PrimaryButton>
      </div>
    </ContentCard>
  );
};
