import React from 'react';
import { TwoColumnContentLayout } from '@/components/layout/TwoColumnContentLayout/TwoColumnContentLayout.tsx';
import { TaskInstructionsSection } from '@/features/tasks/components/TaskInstructionsSection/TaskInstructionsSection';
import { TaskSubmissionSection } from '@/features/tasks/components/TaskSubmissionSection/TaskSubmissionSection.tsx';
import { CommentsSection } from '@/features/comments/components/CommentsSection/CommentsSection';
import { useStore } from '@/stores/useStore';
import { TaskResponse } from '@/types/tasks.types.ts';
import { useTaskSubmission } from '@/features/tasks/hooks/useTaskSubmission';
import { useParams } from 'react-router-dom';

interface StudentTaskWorkspaceProps {
  task: TaskResponse;
  onBack: () => void;
}

export const StudentTaskWorkspace: React.FC<StudentTaskWorkspaceProps> = ({ task, onBack }) => {
  const { taskId } = useParams<{ taskId: string }>();
  const user = useStore((state) => state.user);
  const isStudent = user?.roles.includes('STUDENT');

  const {
    submissionStatus,
    grade,
    submittedFiles,
    onAddFile,
    onAddLink,
    onRemoveFile,
    onSubmitWork,
  } = useTaskSubmission('Assigned');

  return (
    <TwoColumnContentLayout
      title={task.title}
      onBack={onBack}
      showHeaderButton={false}
      sidebarContent={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <TaskSubmissionSection
            status={submissionStatus}
            grade={grade}
            maxGrade={12}
            submittedFiles={submittedFiles}
            onAddFile={onAddFile}
            onAddLink={onAddLink}
            onRemoveFile={onRemoveFile}
            onSubmitOrReturn={onSubmitWork}
            isTeacher={false}
          />
        </div>
      }
    >
      <TaskInstructionsSection />
      {isStudent && (
        <CommentsSection
          taskId={taskId}
          targetStudentId={user?.id}
          currentUserAvatar={user?.avatarUrl}
        />
      )}
    </TwoColumnContentLayout>
  );
};
