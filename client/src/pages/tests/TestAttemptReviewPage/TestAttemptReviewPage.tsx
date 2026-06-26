import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TestAttemptReviewWorkspace } from '@/features/tests/components/TestAttemptReviewWorkspace/TestAttemptReviewWorkspace.tsx';

export const TestAttemptReviewPage: React.FC = () => {
  const navigate = useNavigate();

  const { attemptId } = useParams<{ attemptId: string }>();

  const handleBackClick = () => {
    navigate(-1);
  };

  return <TestAttemptReviewWorkspace attemptId={attemptId} onBack={handleBackClick} />;
};
