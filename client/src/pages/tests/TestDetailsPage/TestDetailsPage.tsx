import React from 'react';
import { TestDetailsWorkspace } from '@/features/tests/components/TestDetailsWorkspace/TestDetailsWorkspace.tsx';
import { useNavigate, useParams } from 'react-router-dom';

export const TestDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleStartAttempt = () => {
    console.log(`Запуск прохождения теста с ID: ${testId}`);
    navigate('execute');
  };

  return <TestDetailsWorkspace onBack={handleBackClick} onStartAttempt={handleStartAttempt} />;
};
