import React, { useState, useEffect } from 'react';
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

export const CoursePage: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | undefined>();
  const isTeacher = useStore((state) => state.isTeacher);

  const activeTab = searchParams.get('tab') || 'materials';

  useEffect(() => {
    if (!searchParams.has('tab')) {
      setSearchParams(
        (prev) => {
          prev.set('tab', 'materials');
          return prev;
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);

  const {
    loading,
    error,
    rawData,
    modules,
    participants,
    announcements,
    lessons,
    unreadAnnouncementsCount,
    unsubmittedWorksCount,
    handleAddLesson,
    handleEditLesson,
    handleDeleteLesson,
    handleEditModule,
    handleDeleteModule,
    handleDeleteModuleItem,
    handleReadAnnouncement,
    handleDeleteAnnouncement,
  } = useGetCourseData(courseId || '');

  const TABS: TabItem[] = [
    { id: 'materials', label: 'Матеріали' },
    {
      id: 'tasks',
      label: 'Завдання',
      badge: unsubmittedWorksCount > 0 ? unsubmittedWorksCount : undefined,
    },
    {
      id: 'announcements',
      label: 'Оголошення',
      badge: unreadAnnouncementsCount > 0 ? unreadAnnouncementsCount : undefined,
    },
    { id: 'participants', label: 'Учасники' },
  ];

  const handleTabChange = (id: string) => {
    setSearchParams((prev) => {
      prev.set('tab', id);
      return prev;
    });
  };

  const taskModules = modules.map((module) => ({
    ...module,
    items: module.items.filter((item) => item.type === 'TASK' || item.type === 'TEST'),
  }));

  const handleModuleItemClick = (item: ModuleItemData) => {
    switch (item.type) {
      case 'TASK':
        navigate(`/courses/${courseId}/tasks/${item.id}`);
        break;
      case 'TEST':
        navigate(`/courses/${courseId}/tests/${item.id}`);
        break;
      case 'LINK':
        if (item.linkUrl) {
          window.open(item.linkUrl, '_blank', 'noopener,noreferrer');
        } else {
          toast.error('Посилання відсутнє');
        }
        break;
      case 'THEORY':
        if (item.fileUrl) {
          window.open(item.fileUrl, '_blank', 'noopener,noreferrer');
        } else {
          toast.error('Файл відсутній');
        }
        break;
      default:
        console.warn('Невідомий тип матеріалу:', item);
    }
  };

  const handleEditModuleItem = (item: ModuleItemData) => {
    if (item.type === 'LINK') {
      navigate(`/courses/${courseId}/materials/links/${item.id}/edit`);
    } else if (item.type === 'THEORY') {
      navigate(`/courses/${courseId}/materials/files/${item.id}/edit`);
    } else if (item.type === 'TASK') {
      navigate(`/courses/${courseId}/tasks/${item.id}/edit`);
    } else if (item.type === 'TEST') {
      navigate(`/courses/${courseId}/tests/${item.id}/edit`);
    }
  };

  if (loading) return <div>Завантаження курсу...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.pageContainer}>
      <CourseBanner
        title={rawData?.subject?.name || 'Без назви'}
        classNumber={rawData?.class?.name}
        themeColor={rawData?.themeColor}
        backgroundImage={rawData?.backgroundUrl}
        onEdit={() => navigate(`/courses/${courseId}/edit`)}
        showEditButton={isTeacher}
      />

      <Tabs items={TABS} activeId={activeTab} onTabChange={handleTabChange} />

      {isTeacher && (
        <CourseCreateButton
          onCreateLink={() => navigate(`/courses/${courseId}/materials/links/create`)}
          onCreateMaterial={() => navigate(`/courses/${courseId}/materials/files/create`)}
          onCreateTask={() => navigate(`/courses/${courseId}/tasks/create`)}
          onCreateTest={() => navigate(`/courses/${courseId}/tests/create`)}
          onCreateAnnouncement={() => navigate(`/courses/${courseId}/announcements/create`)}
        />
      )}

      {activeTab === 'materials' && (
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
          showMoreMenu={isTeacher}
        />
      )}

      {activeTab === 'tasks' && (
        <ModuleList
          showMoreMenu={isTeacher}
          modules={taskModules}
          onItemClick={handleModuleItemClick}
          onEditModule={handleEditModule}
          onDeleteModule={handleDeleteModule}
          onEditItem={handleEditModuleItem}
          onDeleteItem={handleDeleteModuleItem}
        />
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

      {activeTab === 'participants' && (
        <ParticipantsWorkspace
          teachers={participants.teachers}
          coTeachers={participants.coTeachers}
          classHomeroomTeacher={participants.classHomeroomTeacher}
          students={participants.students}
        />
      )}
    </div>
  );
};
