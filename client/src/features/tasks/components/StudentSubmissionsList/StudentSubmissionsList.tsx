import React from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard';
import {
  StudentSubmissionItem,
  SubmissionStatus,
} from '@/components/tasks/StudentSubmissionItem/StudentSubmissionItem';

export interface Submission {
  id: string;
  studentName: string;
  avatarUrl?: string;
  status: SubmissionStatus;
  grade?: string | number | null;
}

interface StudentSubmissionsListProps {
  submissions: Submission[];
  selectedId?: string; // ← Добавили проп для id выбранного студента
  onItemClick?: (id: string) => void;
}

export const StudentSubmissionsList: React.FC<StudentSubmissionsListProps> = ({
  submissions,
  selectedId, // ← Деструктуризируем
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
