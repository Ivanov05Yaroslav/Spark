import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EditTestForm } from '@/features/tests/components/EditTestForm/EditTestForm.tsx';

export const EditTestPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  return <EditTestForm onBack={handleBackClick} />;
};
