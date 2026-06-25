import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TwoColumnContentLayout } from '@/components/layout/TwoColumnContentLayout/TwoColumnContentLayout.tsx';
import { TaskInstructionsSection } from '@/features/tasks/components/TaskInstructionsSection/TaskInstructionsSection';
// import { TaskSubmissionSection } from '@/features/tasks/components/TaskSubmissionSection/TaskSubmissionSection';
import { TaskCommentsSection } from '@/features/tasks/components/TaskCommentsSection/TaskCommentsSection';
import { useTaskInstructions } from '@/features/tasks/hooks/useTaskInstructions';

export const GeneralTaskDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  const { taskId } = useParams<{ taskId: string }>();

  const { task, isLoading, error } = useTaskInstructions(taskId);

  const [submissionStatus, setSubmissionStatus] = useState<
    'Assigned' | 'Turned in' | 'Graded' | 'Missing'
  >('Assigned');
  const [grade, setGrade] = useState<string | number>('');
  const [submittedFiles, setSubmittedFiles] = useState([
    { id: 'f1', name: 'UI_UX_Practice_Done.pdf' },
  ]);

  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: {
        name: 'Дмитро Коваленко',
        avatarUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSolfQ0VyDwW3mc6xHVFWn01UBMDpSXPY0wpw&s',
      },
      timestamp: 'Вчора, 18:40',
      content:
        "Підкажіть, будь ласка, чи можна використовувати власну палітру кольорів, чи обов'язково брати ту, що в ТЗ?",
    },
  ]);

  const handleGradeChange = (newGrade: string) => setGrade(newGrade);
  const handleAddFile = () => alert('Вiдкриття модального вiкна завантаження файлiв');
  const handleRemoveFile = (fileId: string) =>
    setSubmittedFiles((prev) => prev.filter((f) => f.id !== fileId));
  const handleSubmitOrReturn = () => {
    if (submissionStatus === 'Assigned') setSubmissionStatus('Turned in');
    else if (submissionStatus === 'Turned in') setSubmissionStatus('Assigned');
  };

  const handleAddComment = (content: string) => {
    setComments((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        author: {
          name: 'Поточний Користувач',
          avatarUrl:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSolfQ0VyDwW3mc6xHVFWn01UBMDpSXPY0wpw&s',
        },
        timestamp: 'Щойно',
        content: content,
      },
    ]);
  };
  const handleReplyComment = (commentId: string) => console.log('Reply to comment:', commentId);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        Завантаження сторінки завдання...
      </div>
    );
  }

  if (error || !task) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '50px',
          color: 'red',
        }}
      >
        {error || 'Завдання не знайдено.'}
      </div>
    );
  }

  return (
    <TwoColumnContentLayout
      title={task.title}
      onBack={handleBack}
      showHeaderButton={false}
      // sidebarContent={
      //     <TaskSubmissionSection
      //         status={submissionStatus}
      //         grade={grade}
      //         maxGrade={12}
      //         submittedFiles={submittedFiles}
      //         onGradeChange={handleGradeChange}
      //         onAddFile={handleAddFile}
      //         onRemoveFile={handleRemoveFile}
      //         onSubmitOrReturn={handleSubmitOrReturn}
      //         isTeacher={false}
      //     />
      // }
      sidebarContent
    >
      <TaskInstructionsSection />

      <TaskCommentsSection comments={comments} onAddComment={handleAddComment} />
    </TwoColumnContentLayout>
  );
};
