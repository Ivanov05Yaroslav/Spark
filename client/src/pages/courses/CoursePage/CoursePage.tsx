import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CourseBanner } from '@/features/courses/components/CourseBanner/CourseBanner';
import { TabItem, Tabs } from '@/components/ui/Tabs/Tabs';
import { CourseCreateButton } from '@/features/courses/components/CourseCreateButton/CourseCreateButton';
import { ModuleList } from '@/features/courses/components/ModuleList/ModuleList';
import styles from './CoursePage.module.css';
import { CourseWorkspace } from '@/features/courses/components/CourseWorkspace/CourseWorkspace.tsx';
import { AnnouncementsWorkspace } from '@/features/announcements/components/AnnouncementsWorkspace/AnnouncementsWorkspace.tsx';
import { ParticipantsWorkspace } from '@/features/courses/components/ParticipantsWorkspace/ParticipantsWorkspace.tsx';
import { useGetCourseData } from '@/features/courses/hooks/useGetCourseData.ts';

export const CoursePage: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('materials');
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | undefined>();

  const {
    loading,
    error,
    rawData,
    modules,
    participants,
    announcements,
    lessons,
    unreadAnnouncementsCount,
    handleAddLesson,
    handleEditLesson,
    handleDeleteLesson,
  } = useGetCourseData(courseId || '');

  const TABS: TabItem[] = [
    { id: 'materials', label: 'Матеріали' },
    {
      id: 'tasks',
      label: 'Завдання',
      badge:
        modules.reduce(
          (acc, mod) =>
            acc + mod.items.filter((i) => i.type === 'TASK' || i.type === 'TEST').length,
          0,
        ) || undefined,
    },
    {
      id: 'announcements',
      label: 'Оголошення',
      badge: unreadAnnouncementsCount > 0 ? unreadAnnouncementsCount : undefined,
    },
    { id: 'participants', label: 'Учасники' },
  ];

  if (loading) return <div>Завантаження курсу...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.pageContainer}>
      <CourseBanner
        title={rawData?.subject?.name || 'Без назви'}
        classNumber={rawData?.class?.name}
        themeColor={rawData?.themeColor}
        backgroundImage={rawData?.backgroundUrl}
        onEdit={() => console.log('Edit course')}
      />

      <Tabs items={TABS} activeId={activeTab} onTabChange={setActiveTab} />

      <CourseCreateButton
        onCreateModule={() => console.log('Module')}
        onCreateMaterial={() => console.log('Material')}
        onCreateTask={() => console.log('Task')}
        onCreateTest={() => console.log('Test')}
        onCreateAnnouncement={() => console.log('Announcement')}
      />

      {activeTab === 'materials' && (
        <CourseWorkspace
          lessons={lessons}
          modules={modules}
          onAddLesson={handleAddLesson}
          onEditLesson={handleEditLesson}
          onDeleteLesson={handleDeleteLesson}
          onModuleItemClick={(item, moduleId) => console.log(item, moduleId)}
          onEditModule={(id) => console.log('Редагувати модуль:', id)}
          onDeleteModule={(id) => console.log('Видалити модуль:', id)}
        />
      )}

      {activeTab === 'tasks' && (
        <ModuleList
          showMoreMenu={true}
          modules={modules}
          onItemClick={(item) => console.log(item)}
          onEditModule={(id) => console.log('Редагувати модуль:', id)}
          onDeleteModule={(id) => console.log('Видалити модуль:', id)}
        />
      )}

      {activeTab === 'announcements' && (
        <AnnouncementsWorkspace
          announcements={announcements}
          selectedId={selectedAnnouncementId}
          onItemClick={setSelectedAnnouncementId}
        />
      )}

      {activeTab === 'participants' && (
        <ParticipantsWorkspace
          teachers={participants.teachers}
          coTeachers={participants.coTeachers}
          classHomeroomTeacher={participants.homeroom}
          students={participants.students}
        />
      )}
    </div>
  );
};
