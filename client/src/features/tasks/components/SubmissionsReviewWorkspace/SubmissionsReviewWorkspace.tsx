import React from 'react';
import { useParams } from 'react-router-dom';
import { StudentWorkSection } from '@/features/tasks/components/StudentWorkSection/StudentWorkSection';
import { CommentsSection } from '@/features/comments/components/CommentsSection/CommentsSection';
import styles from './SubmissionsReviewWorkspace.module.css';
import { StudentSubmissionsList } from '@/features/tasks/components/StudentSubmissionsList/StudentSubmissionsList.tsx';
import { useTaskSubmissionsReview } from '@/features/tasks/hooks/useTaskSubmissionsReview';
import { useStore } from '@/stores/useStore';
import { formatToDateTime } from '@/libs/utils/date';

export const SubmissionsReviewWorkspace: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const currentUser = useStore((state) => state.user);

  const {
    mappedSubmissions,
    selectedStudentId,
    setSelectedStudentId,
    submissionDetail,
    statusText,
    gradeValue,
    setGradeValue,
    handleGradeSubmit,
  } = useTaskSubmissionsReview(taskId);

  const hasSubmission = !!(selectedStudentId && submissionDetail?.id);

  return (
    <div className={styles.contentGrid}>
      <div className={styles.leftColumn}>
        <StudentSubmissionsList
          submissions={mappedSubmissions}
          selectedId={selectedStudentId}
          onItemClick={(id) => setSelectedStudentId(id)}
        />
      </div>

      <div className={styles.rightColumn}>
        <StudentWorkSection
          statusText={statusText}
          submittedAt={
            submissionDetail?.submittedAt ? formatToDateTime(submissionDetail.submittedAt) : null
          }
          attachments={submissionDetail?.attachments || []}
          showGradeBlock={hasSubmission}
          gradeValue={gradeValue}
          onGradeChange={setGradeValue}
          onGradeSubmit={handleGradeSubmit}
        />

        {selectedStudentId && (
          <CommentsSection
            taskId={taskId}
            targetStudentId={selectedStudentId}
            currentUserAvatar={currentUser?.avatarUrl}
          />
        )}
      </div>
    </div>
  );
};
