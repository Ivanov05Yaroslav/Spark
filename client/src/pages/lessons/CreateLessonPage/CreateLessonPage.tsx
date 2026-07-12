import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateLessonForm } from '@/features/lessons/components/CreateLessonForm/CreateLessonForm.tsx';

export const CreateLessonPage: React.FC = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  return <CreateLessonForm onBack={handleBack} />;
};
