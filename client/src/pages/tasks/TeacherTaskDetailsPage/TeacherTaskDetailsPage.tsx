import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Tabs } from '@/components/ui/Tabs/Tabs';
import { TaskInstructionsSection } from '@/features/tasks/components/TaskInstructionsSection/TaskInstructionsSection';
import styles from './TeacherTaskDetailsPage.module.css';
import { useTestPreview } from '@/features/tests/hooks/useTestPreview.ts';
import { SubmissionsReviewWorkspace } from '@/features/tasks/components/SubmissionsReviewWorkspace/SubmissionsReviewWorkspace.tsx';

export const TeacherTaskDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const { test, isLoading } = useTestPreview(testId);

  const activeTab = searchParams.get('tab') || 'details';

  useEffect(() => {
    if (!searchParams.has('tab')) {
      setSearchParams(
        (prev) => {
          prev.set('tab', 'details');
          return prev;
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);

  const tabItems = [
    { id: 'instructions', label: 'Інструкція' },
    { id: 'submissions', label: 'Роботи студентів' },
  ];

  const handleTabChange = (id: string) => {
    setSearchParams((prev) => {
      prev.set('tab', id);
      return prev;
    });
  };

  if (isLoading) return <div className={styles.loading}>Завантаження...</div>;

  return (
    <div className={styles.pageContainer}>
      <PageHeader title={task?.title || 'Завдання'} />

      <div className={styles.tabsWrapper}>
        <Tabs items={tabItems} activeId={activeTab} onTabChange={handleTabChange} />
      </div>

      <main className={styles.mainContent}>
        {activeTab === 'instructions' ? (
          <TaskInstructionsSection />
        ) : (
          <SubmissionsReviewWorkspace />
        )}
      </main>
    </div>
  );
};
