import React from 'react';
import { StudentWorkSection } from '@/features/tasks/components/StudentWorkSection/StudentWorkSection';
import { TaskCommentsSection } from '@/features/tasks/components/TaskCommentsSection/TaskCommentsSection';
import { CommentProps } from '@/components/tasks/CommentItem/CommentItem';
import styles from './SubmissionReviewPanel.module.css';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton.tsx';

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

export const SubmissionReviewPanel: React.FC<SubmissionReviewPanelProps> = ({
  gradeValue,
  maxGrade = 12,
  onGradeChange,
  onReturnClick,
  isReturnDisabled = false,
  studentWork,
  commentsData,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.gradingHeader}>
        <div className={styles.gradeInputWrapper}>
          <input
            type="text"
            className={styles.gradeInput}
            value={gradeValue}
            onChange={(e) => onGradeChange(e.target.value)}
            placeholder="—"
          />
          <span className={styles.maxGrade}>/ {maxGrade}</span>
        </div>

        <PrimaryButton
          onClick={onReturnClick}
          disabled={isReturnDisabled}
          style={{ width: '140px' }}
        >
          Повернути
        </PrimaryButton>
      </div>

      <StudentWorkSection
        statusText={studentWork.statusText}
        submittedAt={studentWork.submittedAt}
        attachments={studentWork.attachments}
      />

      <TaskCommentsSection
        comments={commentsData.comments}
        currentUserAvatar={commentsData.currentUserAvatar}
        onAddComment={commentsData.onAddComment}
        onEditComment={commentsData.onEditComment}
        onDeleteComment={commentsData.onDeleteComment}
      />
    </div>
  );
};
