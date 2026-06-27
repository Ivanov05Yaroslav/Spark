import React from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard';
import {
  StudentSubmissionItem,
  SubmissionStatus,
} from '@/components/tasks/StudentSubmissionItem/StudentSubmissionItem';
import styles from './StudentSubmissionsList.module.css';

export interface Submission {
  id: string;
  studentName: string;
  avatarUrl?: string;
  status: SubmissionStatus;
  grade?: string | number | null;
}

interface StudentSubmissionsListProps {
  submissions: Submission[];
  selectedId?: string;
  onItemClick?: (id: string) => void;
}

export const StudentSubmissionsList: React.FC<StudentSubmissionsListProps> = ({
  submissions,
  selectedId,
  onItemClick,
}) => {
  if (!submissions || submissions.length === 0) {
    return (
      <ContentCard>
        <p style={{ color: '#6B7280', margin: 0, textAlign: 'center' }}>
          Немає робіт для відображення.
        </p>
      </ContentCard>
    );
  }

  return (
    <ContentCard>
      <div className={styles.listContainer}>
        {submissions.map((sub) => (
          <StudentSubmissionItem
            key={sub.id}
            studentName={sub.studentName}
            avatarUrl={sub.avatarUrl}
            status={sub.status}
            grade={sub.grade}
            isActive={sub.id === selectedId}
            onClick={() => onItemClick?.(sub.id)}
          />
        ))}
      </div>
    </ContentCard>
  );
};
