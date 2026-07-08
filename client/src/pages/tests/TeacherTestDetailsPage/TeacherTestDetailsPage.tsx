import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import styles from '@/pages/tasks/TeacherTaskDetailsPage/TeacherTaskDetailsPage.module.css';
import { useTestPreview } from '@/features/tests/hooks/useTestPreview.ts';
import { TestPreviewWorkspace } from '@/features/tests/components/TestPreviewWorkspace/TestPreviewWorkspace.tsx';
import { TeacherTestSubmissionsWorkspace } from '@/features/tests/components/TeacherTestSubmissionsWorkspace/TeacherTestSubmissionsWorkspace.tsx';
import { Tabs } from '@/components/ui/Tabs/Tabs.tsx';

export const TeacherTestDetailsPage: React.FC = () => {
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
    { id: 'details', label: 'Деталі тесту' },
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
      <PageHeader
        title={test?.title || 'Тест'}
        showBottomBorder={false}
        onBack={() => navigate(-1)}
      />

      <div className={styles.tabsWrapper}>
        <Tabs items={tabItems} activeId={activeTab} onTabChange={handleTabChange} />
      </div>

      <main className={styles.mainContent}>
        {activeTab === 'details' ? <TestPreviewWorkspace /> : <TeacherTestSubmissionsWorkspace />}
      </main>
    </div>
  );
};
