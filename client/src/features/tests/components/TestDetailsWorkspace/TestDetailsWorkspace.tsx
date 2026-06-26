import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TwoColumnContentLayout } from '@/components/layout/TwoColumnContentLayout/TwoColumnContentLayout.tsx';
import { TestOverviewCard } from '@/features/tests/components/TestOverviewCard/TestOverviewCard';
import { TestResultsTable } from '@/features/tests/components/TestResultsTable/TestResultsTable';
import { CommentsSection } from '@/features/comments/components/CommentsSection/CommentsSection.tsx';
import { useTestOverview } from '@/features/tests/hooks/useTestOverview';
import { useTestAttempts } from '@/features/tests/hooks/useTestAttempts';
import { useStore } from '@/stores/useStore';

interface TestDetailsWorkspaceProps {
  onBack: () => void;
  onStartAttempt: () => void;
}

export const TestDetailsWorkspace: React.FC<TestDetailsWorkspaceProps> = ({
  onBack,
  onStartAttempt,
}) => {
  const { id, testId } = useParams<{ id: string; testId: string }>();
  const navigate = useNavigate();

  const { overviewData, isLoading: isOverviewLoading } = useTestOverview(testId);
  const { attemptsData, formattedAttempts, isLoading: isAttemptsLoading } = useTestAttempts(testId);

  const user = useStore((state) => state.user);

  const hasAvailableAttempts = attemptsData
    ? attemptsData.usedAttempts < attemptsData.maxAttempts
    : false;

  const handleViewOverview = (attemptId: string) => {
    navigate(`/courses/${id}/tests/${testId}/review/${attemptId}`);
  };

  const isStudent = user?.roles.includes('STUDENT');
  const targetStudentId = isStudent ? user?.id : undefined;

  if (isOverviewLoading) {
    return <div style={{ padding: '24px' }}>Завантаження деталей тесту...</div>;
  }

  if (!overviewData) {
    return <div style={{ padding: '24px' }}>Тест не знайдено.</div>;
  }

  return (
    <TwoColumnContentLayout
      title={overviewData.title}
      onBack={onBack}
      sidebarContent={
        <TestOverviewCard
          duration={overviewData.duration}
          attemptsAllowed={overviewData.attemptsAllowed}
          questionsCount={overviewData.questionsCount}
          hasAvailableAttempts={hasAvailableAttempts}
          dueDate={overviewData.dueDate}
          onStart={onStartAttempt}
        />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {isAttemptsLoading ? (
          <div>Завантаження спроб...</div>
        ) : (
          <TestResultsTable attempts={formattedAttempts} onViewDetails={handleViewOverview} />
        )}

        {isStudent && (
          <CommentsSection
            testId={testId}
            targetStudentId={targetStudentId}
            currentUserAvatar={user?.avatarUrl}
          />
        )}
      </div>
    </TwoColumnContentLayout>
  );
};
