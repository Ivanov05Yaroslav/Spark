import React from 'react';
import { TwoColumnContentLayout } from '@/components/layout/TwoColumnContentLayout/TwoColumnContentLayout.tsx';
import { TestOverviewCard } from '@/features/tests/components/TestOverviewCard/TestOverviewCard';
import {
  TestResultsTable,
  TestAttempt,
} from '@/features/tests/components/TestResultsTable/TestResultsTable';
import { TaskCommentsSection } from '@/features/tasks/components/TaskCommentsSection/TaskCommentsSection.tsx';
import { CommentProps } from '@/components/tasks/CommentItem/CommentItem.tsx';

interface TestDetailsWorkspaceProps {
  onBack: () => void;
  onStartAttempt: () => void;
}

export const TestDetailsWorkspace: React.FC<TestDetailsWorkspaceProps> = ({
  onBack,
  onStartAttempt,
}) => {
  const mockAttempts: TestAttempt[] = [
    {
      id: '1',
      number: 1,
      duration: '15:59',
      correctAnswers: 10,
      wrongAnswers: 5,
      completionDate: 'March 25, 2026 at 23:59',
      mark: 12,
      hasDetails: true,
    },
    {
      id: '2',
      number: 2,
      duration: '15:59',
      correctAnswers: null,
      wrongAnswers: null,
      completionDate: 'March 25, 2026 at 23:59',
      mark: null,
      hasDetails: false,
    },
  ];

  const mockComments = [
    {
      id: 'c1',
      author: {
        name: 'Анна Студентка',
        avatarUrl: 'https://www.w3schools.com/w3images/avatar6.png',
      },
      content: 'Чи буде враховано час на завантаження сторінки?',
      createdAt: '14:30',
    },
    {
      id: 'c2',
      author: {
        name: 'Анна Студентка',
        avatarUrl: 'https://www.w3schools.com/w3images/avatar6.png',
      },
      content: 'Таймер зупиняється лише після натискання кнопки "Завершити тест".',
      createdAt: '15:00',
    },
  ] as unknown as CommentProps[];

  const handleViewOverview = (id: string) => {
    console.log('Перегляд деталей спроби:', id);
  };

  const handleAddComment = (content: string) => {
    console.log('Відправка коментаря:', content);
  };

  const handleEditComment = (id: string) => {
    console.log('Редагування коментаря:', id);
  };

  const handleDeleteComment = (id: string) => {
    console.log('Видалення коментаря:', id);
  };

  return (
    <TwoColumnContentLayout
      title="Назва тесту (Overview)"
      onBack={onBack}
      sidebarContent={
        <TestOverviewCard
          duration="20 minutes"
          attemptsAllowed={2}
          questionsCount={15}
          dueDate="March 25, 2026 at 23:59"
          onStart={onStartAttempt}
        />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <TestResultsTable attempts={mockAttempts} onViewDetails={handleViewOverview} />

        <TaskCommentsSection
          comments={mockComments}
          currentUserAvatar=""
          onAddComment={handleAddComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
        />
      </div>
    </TwoColumnContentLayout>
  );
};
