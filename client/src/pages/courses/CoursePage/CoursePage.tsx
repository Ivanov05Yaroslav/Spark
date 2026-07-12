import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CourseBanner } from '@/features/courses/components/CourseBanner/CourseBanner';
import { TabItem, Tabs } from '@/components/ui/Tabs/Tabs';
import { CourseCreateButton } from '@/features/courses/components/CourseCreateButton/CourseCreateButton';
import { ModuleItemData, ModuleList } from '@/features/courses/components/ModuleList/ModuleList';
import styles from './CoursePage.module.css';
import { CourseWorkspace } from '@/features/courses/components/CourseWorkspace/CourseWorkspace.tsx';
import { AnnouncementsWorkspace } from '@/features/announcements/components/AnnouncementsWorkspace/AnnouncementsWorkspace.tsx';
import { ParticipantsWorkspace } from '@/features/courses/components/ParticipantsWorkspace/ParticipantsWorkspace.tsx';
import { useGetCourseData } from '@/features/courses/hooks/useGetCourseData.ts';
import { toast } from '@/libs/configs/Toast';
import { useStore } from '@/stores/useStore.ts';
import { JournalWorkspace } from '@/features/journal/components/JournalWorkspace/JournalWorkspace.tsx';
import { tasksService } from '@/api/tasks.service.ts';
import { testsService } from '@/api/tests.service.ts';

export const CoursePage: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | undefined>();
  const isTeacher = useStore((state) => state.isTeacher);

  const {
    loading,
    error,
    rawData,
    modules,
    taskModules,
    participants,
    announcements,
    lessons,
    unreadAnnouncementsCount,
    unsubmittedWorksCount,
    handleAddLesson,
    handleEditLesson,
    handleDeleteLesson,
    handleDeleteModuleItem,
    handleReadAnnouncement,
    handleDeleteAnnouncement,
    refetch,
  } = useGetCourseData(courseId);

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const activeTab = searchParams.get('tab') || 'workspace';

  const tabs: TabItem[] = [
    { id: 'workspace', label: 'Матеріали' },
    { id: 'tasks', label: 'Завдання', badge: unsubmittedWorksCount },
    { id: 'journal', label: 'Журнал' },
    { id: 'announcements', label: 'Оголошення', badge: unreadAnnouncementsCount },
    { id: 'participants', label: 'Учасники' },
  ];

  const handleEditModule = (moduleId: string, newTitle: string) => {
    console.log('Edit module', moduleId, newTitle);
  };

  const handleDeleteModule = (moduleId: string) => {
    console.log('Delete module', moduleId);
  };

  const handleEditModuleItem = (item: ModuleItemData) => {
    if (item.type === 'LESSON') navigate(`/courses/${courseId}/lessons/${item.id}/edit`);
    else if (item.type === 'TASK') navigate(`/courses/${courseId}/tasks/${item.id}/edit`);
    else if (item.type === 'TEST') navigate(`/courses/${courseId}/tests/${item.id}/edit`);
    else navigate(`/courses/${courseId}/materials/${item.id}/edit`);
  };

  const handleModuleItemClick = (item: ModuleItemData) => {
    if (item.type === 'TASK') navigate(`/courses/${courseId}/tasks/${item.id}`);
    else if (item.type === 'TEST') navigate(`/courses/${courseId}/tests/${item.id}`);
    else if (item.linkUrl) window.open(item.linkUrl, '_blank');
    else if (item.fileUrl) window.open(item.fileUrl, '_blank');
  };

  const handleAddBadgeTask = (item: ModuleItemData) => {
    navigate(
      `/courses/${courseId}/tasks/create?lessonId=${item.id}&lessonTitle=${encodeURIComponent(item.title)}`,
    );
  };

  const handleAddBadgeTest = (item: ModuleItemData) => {
    navigate(
      `/courses/${courseId}/tests/create?lessonId=${item.id}&lessonTitle=${encodeURIComponent(item.title)}`,
    );
  };

  const handleBadgeTaskClick = (taskId: string) => navigate(`/courses/${courseId}/tasks/${taskId}`);
  const handleBadgeTestClick = (testId: string) => navigate(`/courses/${courseId}/tests/${testId}`);

  const handleEditBadgeTask = (taskId: string, parentItem?: ModuleItemData) => {
    const query =
      parentItem && parentItem.type === 'LESSON'
        ? `?lessonId=${parentItem.id}&lessonTitle=${encodeURIComponent(parentItem.title)}`
        : '';
    navigate(`/courses/${courseId}/tasks/${taskId}/edit${query}`);
  };

  const handleEditBadgeTest = (testId: string, parentItem?: ModuleItemData) => {
    const query =
      parentItem && parentItem.type === 'LESSON'
        ? `?lessonId=${parentItem.id}&lessonTitle=${encodeURIComponent(parentItem.title)}`
        : '';
    navigate(`/courses/${courseId}/tests/${testId}/edit${query}`);
  };

  const handleDeleteBadgeTask = async (taskId: string) => {
    try {
      await tasksService.deleteTask(taskId);
      toast.success('Завдання успішно видалено!');
      refetch();
    } catch (err) {
      console.error('Помилка при видаленні завдання:', err);
      toast.error('Помилка при видаленні завдання');
    }
  };

  const handleDeleteBadgeTest = async (testId: string) => {
    try {
      await testsService.deleteTest(testId);
      toast.success('Тест успішно видалено!');
      refetch();
    } catch (err) {
      console.error('Помилка при видаленні тесту:', err);
      toast.error('Помилка при видаленні тесту');
    }
  };

  if (loading) return <div>Завантаження...</div>;
  if (error || !rawData) return <div>{error || 'Курс не знайдено'}</div>;

  return (
    <div className={styles.pageContainer}>
      <CourseBanner
        title={rawData.subject?.name || 'Без назви'}
        classNumber={rawData.class?.name || ''}
        backgroundImage={rawData.backgroundUrl || undefined}
        showEditButton={isTeacher}
      />

      <Tabs items={tabs} activeId={activeTab} onTabChange={handleTabChange} />

      {isTeacher && (
        <CourseCreateButton
          onCreateLink={() => navigate(`/courses/${courseId}/materials/create`)}
          onCreateLesson={() => navigate(`/courses/${courseId}/lessons/create`)}
          onCreateMaterial={() => navigate(`/courses/${courseId}/materials/create`)}
          onCreateTask={() => navigate(`/courses/${courseId}/tasks/create`)}
          onCreateTest={() => navigate(`/courses/${courseId}/tests/create`)}
          onCreateAnnouncement={() => navigate(`/courses/${courseId}/announcements/create`)}
        />
      )}

      {activeTab === 'workspace' && (
        <CourseWorkspace
          lessons={lessons}
          modules={modules}
          onAddLesson={handleAddLesson}
          onEditLesson={handleEditLesson}
          onDeleteLesson={handleDeleteLesson}
          onModuleItemClick={handleModuleItemClick}
          onEditModule={handleEditModule}
          onDeleteModule={handleDeleteModule}
          onEditItem={handleEditModuleItem}
          onDeleteItem={handleDeleteModuleItem}
          onAddTask={handleAddBadgeTask}
          onAddTest={handleAddBadgeTest}
          onTaskClick={handleBadgeTaskClick}
          onTestClick={handleBadgeTestClick}
          onEditTask={handleEditBadgeTask}
          onDeleteTask={handleDeleteBadgeTask}
          onEditTest={handleEditBadgeTest}
          onDeleteTest={handleDeleteBadgeTest}
          showMoreMenu={isTeacher}
        />
      )}

      {activeTab === 'tasks' && (
        <div className={styles.tasksWrapper}>
          <ModuleList
            showMoreMenu={isTeacher}
            modules={taskModules}
            onItemClick={handleModuleItemClick}
            onEditModule={handleEditModule}
            onDeleteModule={handleDeleteModule}
            onEditItem={handleEditModuleItem}
            onDeleteItem={handleDeleteModuleItem}
            onTaskClick={handleBadgeTaskClick}
            onTestClick={handleBadgeTestClick}
            onEditTask={handleEditBadgeTask}
            onEditTest={handleEditBadgeTest}
          />
        </div>
      )}

      {activeTab === 'announcements' && (
        <AnnouncementsWorkspace
          announcements={announcements}
          selectedId={selectedAnnouncementId}
          onItemClick={(id) => {
            setSelectedAnnouncementId(id);
            handleReadAnnouncement(id);
          }}
          onEdit={(id) => navigate(`/courses/${courseId}/announcements/${id}/edit`)}
          onDelete={handleDeleteAnnouncement}
          showMoreMenu={isTeacher}
        />
      )}

      {activeTab === 'journal' && <JournalWorkspace />}

      {activeTab === 'participants' && (
        <ParticipantsWorkspace
          teachers={participants.teachers}
          coTeachers={participants.coTeachers}
          classHomeroomTeacher={
            participants.classHomeroomTeacher ? [participants.classHomeroomTeacher] : []
          }
          students={participants.students}
        />
      )}
    </div>
  );
};
