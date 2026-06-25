import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EditTaskForm } from '@/features/tasks/components/EditTaskForm/EditTaskForm.tsx';

export const EditTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  return <EditTaskForm onBack={handleBack} />;
};
