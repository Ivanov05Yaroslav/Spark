import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EditLessonForm } from '@/features/lessons/components/EditLessonForm/EditLessonForm.tsx';

export const EditLessonPage: React.FC = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  return <EditLessonForm onBack={handleBack} />;
};
