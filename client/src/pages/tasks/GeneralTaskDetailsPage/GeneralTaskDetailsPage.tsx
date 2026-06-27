import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaskInstructions } from '@/features/tasks/hooks/useTaskInstructions';
import { StudentTaskWorkspace } from '@/features/tasks/components/StudentTaskWorkspace/StudentTaskWorkspace';

export const GeneralTaskDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const { task, isLoading, error } = useTaskInstructions(taskId);

  const handleBack = () => navigate(-1);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '50px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
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
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {error || 'Завдання не знайдено.'}
      </div>
    );
  }

  return <StudentTaskWorkspace task={task} onBack={handleBack} />;
};
