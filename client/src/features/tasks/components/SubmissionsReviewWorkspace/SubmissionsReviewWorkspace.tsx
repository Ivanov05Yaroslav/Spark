import React from 'react';
import { StudentWorkSection } from '@/features/tasks/components/StudentWorkSection/StudentWorkSection';
import { CommentsSection } from '@/features/comments/components/CommentsSection/CommentsSection';
import { CommentProps } from '@/components/comments/CommentItem/CommentItem';
import styles from './SubmissionsReviewWorkspace.module.css';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton.tsx';
import { StudentSubmissionsList } from '@/features/tasks/components/StudentSubmissionsList/StudentSubmissionsList.tsx';
import { TestResultsTable } from '@/features/tests/components/TestResultsTable/TestResultsTable.tsx';

interface SubmissionReviewPanelProps {
  gradeValue: string | number;
  maxGrade?: number;
  onGradeChange: (value: string) => void;
  onReturnClick: () => void;
  isReturnDisabled?: boolean;

  studentWork: {
    statusText?: string;
    submittedAt?: string | null;
    attachments?: string[];
  };

  commentsData: {
    comments: CommentProps[];
    currentUserAvatar?: string;
    onAddComment: (content: string) => void;
    onEditComment?: (id: string) => void;
    onDeleteComment?: (id: string) => void;
  };
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'Graded':
      return 'Оцінено';
    case 'Turned in':
      return 'Здано';
    case 'Assigned':
      return 'Призначено';
    case 'Missing':
      return 'Протерміновано';
    default:
      return '';
  }
};

export const SubmissionsReviewWorkspace: React.FC<SubmissionReviewPanelProps> = ({
  gradeValue,
  maxGrade = 12,
  onGradeChange,
  onReturnClick,
  isReturnDisabled = false,
  studentWork,
  commentsData,
}) => {
  return (
    <div className={styles.contentGrid}>
      <div className={styles.leftColumn}>
        <StudentSubmissionsList
          submissions={mappedSubmissions}
          selectedId={selectedStudentId}
          onItemClick={handleStudentSelect}
        />
      </div>

      <div className={styles.rightColumn}>
        <StudentWorkSection
          statusText={studentWork.statusText}
          submittedAt={studentWork.submittedAt}
          attachments={studentWork.attachments}
        />

        {selectedStudentId && (
          <CommentsSection
            taskId={taskId}
            targetStudentId={selectedStudentId}
            currentUserAvatar={user?.avatarUrl}
          />
        )}
      </div>
    </div>
  );
};
