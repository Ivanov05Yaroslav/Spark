import React from 'react';
import { useTestAttemptReview } from '@/features/tests/hooks/useTestAttemptReview';
import { TestQuestionCard } from '@/components/tests/TestQuestionCard/TestQuestionCard';
import { CenteredFormLayout } from '@/components/layout/CenteredFormLayout/CenteredFormLayout.tsx';
interface TestAttemptReviewWorkspaceProps {
  attemptId?: string;
  onBack: () => void;
}

export const TestAttemptReviewWorkspace: React.FC<TestAttemptReviewWorkspaceProps> = ({
  attemptId,
  onBack,
}) => {
  const { reviewData, isLoading } = useTestAttemptReview(attemptId);

  if (isLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        Завантаження результатів спроби...
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        Результати спроби не знайдено.
      </div>
    );
  }

  return (
    <CenteredFormLayout
      title="РЕЗУЛЬТАТИ ПРОХОДЖЕННЯ ТЕСТУ"
      onBack={onBack}
      showButton={false}
      maxWidth="1050px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {reviewData.questions.map((question, index) => (
          <TestQuestionCard
            key={question.id}
            index={index}
            question={question}
            isReviewMode={true}
          />
        ))}
      </div>
    </CenteredFormLayout>
  );
};
