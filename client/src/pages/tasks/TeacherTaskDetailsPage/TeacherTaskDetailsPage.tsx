import React, { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Tabs } from '@/components/ui/Tabs/Tabs';
import { TaskInstructionsSection } from '@/features/tasks/components/TaskInstructionsSection/TaskInstructionsSection';
import { SubmissionsReviewWorkspace } from '@/features/tasks/components/SubmissionsReviewWorkspace/SubmissionsReviewWorkspace';
import { useTaskInstructions } from '@/features/tasks/hooks/useTaskInstructions';
import styles from './TeacherTaskDetailsPage.module.css';

export const TeacherTaskDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const { task, isLoading } = useTaskInstructions(taskId);

  const activeTab = searchParams.get('tab') || 'instructions';

  useEffect(() => {
    if (!searchParams.has('tab')) {
      setSearchParams(
        (prev) => {
          prev.set('tab', 'instructions');
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
      <PageHeader
        title={task?.title || 'Завдання'}
        showBottomBorder={false}
        onBack={() => navigate(-1)}
      />
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
