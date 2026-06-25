import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateTaskForm } from '@/features/tasks/components/CreateTaskForm/CreateTaskForm';

export const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  return <CreateTaskForm onBack={handleBack} />;
};
