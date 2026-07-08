import { useState, useEffect } from 'react';
import { courseService } from '@/api/courses.service';
import { CourseDetailResponseDto, CourseUserDto } from '@/types/courses.types';
import { ModuleData, ModuleItemData } from '@/features/courses/components/ModuleList/ModuleList';
import {
  ParticipantData,
  ParticipantRole,
} from '@/components/courses/ParticipantCard/ParticipantCard';
import { DetailedAnnouncement } from '@/features/announcements/components/AnnouncementsWorkspace/AnnouncementsWorkspace';
import { OnlineLessonLink } from '@/features/courses/components/OnlineLessonsBlock/OnlineLessonsBlock';
import { toast } from '@/libs/configs/Toast';
import { materialsService } from '@/api/materials.service.ts';
import { tasksService } from '@/api/tasks.service.ts';
import { testsService } from '@/api/tests.service.ts';
import { announcementService } from '@/api/announcements.service.ts';

const getFullName = (user: CourseUserDto | null | undefined) => {
  if (!user) return 'Невідомий користувач';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim();
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const toParticipant = (
  user: CourseUserDto,
  role: ParticipantRole,
  classGroup?: string,
): ParticipantData => ({
  id: user.id,
  name: getFullName(user),
  role: role,
  avatarUrl: user.avatarUrl || undefined,
  classGroup: classGroup,
});

export const useGetCourseData = (courseId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<CourseDetailResponseDto | null>(null);

  const [modules, setModules] = useState<ModuleData[]>([]);

  const [participants, setParticipants] = useState<{
    teachers: ParticipantData[];
    coTeachers: ParticipantData[];
    classHomeroomTeacher: ParticipantData[];
    students: ParticipantData[];
  }>({ teachers: [], coTeachers: [], classHomeroomTeacher: [], students: [] });

  const [announcements, setAnnouncements] = useState<DetailedAnnouncement[]>([]);

  const [lessons, setLessons] = useState<OnlineLessonLink[]>([]);
  const [unreadAnnouncementsCount, setUnreadAnnouncementsCount] = useState(0);
  const [unsubmittedWorksCount, setUnsubmittedWorksCount] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = (await courseService.getCourseById(
          courseId,
        )) as unknown as CourseDetailResponseDto;
        setRawData(data);

        setLessons(
          data.videoLinks?.map((url: string) => ({
            id: crypto.randomUUID(),
            title: 'Відеоурок',
            url: url,
          })) || [],
        );

        setModules(
          data.modules?.map((m) => ({
            id: m.id,
            title: m.title,
            items: [
              ...(m.materials || []).map((mat) => ({
                id: mat.id,
                type: mat.fileUrl ? ('THEORY' as const) : ('LINK' as const),
                title: mat.title,
                subtitle: mat.fileUrl ? 'Файл' : 'Посилання',
                fileUrl: mat.fileUrl,
                linkUrl: mat.linkUrl,
              })),
              ...(m.tasks || []).map((task) => ({
                id: task.id,
                type: 'TASK' as const,
                title: task.title,
                subtitle: task.deadline ? `Термін: ${formatDate(task.deadline)}` : undefined,
              })),
              ...(m.tests || []).map((test) => ({
                id: test.id,
                type: 'TEST' as const,
                title: test.title,
                subtitle: test.deadline ? `Термін: ${formatDate(test.deadline)}` : undefined,
              })),
            ],
          })) || [],
        );

        const className = data.class?.name;

        setParticipants({
          teachers: data.participants?.creator
            ? [toParticipant(data.participants.creator, 'Вчитель')]
            : [],
          coTeachers:
            data.participants?.coTeachers?.map((ct) => toParticipant(ct, 'Співвчитель')) || [],
          classHomeroomTeacher: data.participants?.homeroomTeacher
            ? [toParticipant(data.participants.homeroomTeacher, 'Класний керівник', className)]
            : [],
          students:
            data.participants?.students?.map((s) => toParticipant(s, 'Студент', className)) || [],
        });

        setAnnouncements(
          data.announcements?.map((a) => ({
            id: a.id,
            authorName: getFullName(a.creator),
            announcementTitle: a.title,
            time: formatDate(a.createdAt),
            content: a.content,
            avatarUrl: a.creator?.avatarUrl || undefined,
            isUnread: a.isNew,
          })) || [],
        );

        setUnreadAnnouncementsCount(data.unreadAnnouncementsCount || 0);
        setUnsubmittedWorksCount(data.unsubmittedWorksCount || 0);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Помилка при завантаженні курсу';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleAddLesson = async (url: string) => {
    const newLink: OnlineLessonLink = { id: crypto.randomUUID(), url };
    const newLessons = [...lessons, newLink];
    setLessons(newLessons);

    try {
      await courseService.updateVideoLinks(
        courseId,
        newLessons.map((l) => l.url),
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Посилання успішно додано!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Помилка при додаванні посилання на сервері');
      setLessons(lessons);
    }
  };

  const handleEditLesson = async (id: string, newUrl: string) => {
    const newLessons = lessons.map((link) => (link.id === id ? { ...link, url: newUrl } : link));
    setLessons(newLessons);

    try {
      await courseService.updateVideoLinks(
        courseId,
        newLessons.map((l) => l.url),
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Посилання успішно оновлено!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Помилка при збереженні змін на сервері');
      setLessons(lessons);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    const newLessons = lessons.filter((link) => link.id !== id);
    setLessons(newLessons);

    try {
      await courseService.updateVideoLinks(
        courseId,
        newLessons.map((l) => l.url),
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Посилання успішно видалено!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Помилка при видаленні посилання на сервері');
      setLessons(lessons);
    }
  };

  const handleEditModule = async (moduleId: string, newTitle: string) => {
    try {
      await courseService.updateModule(moduleId, newTitle);

      setModules((prev) => prev.map((m) => (m.id === moduleId ? { ...m, title: newTitle } : m)));
      toast.success('Модуль успішно оновлено!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Помилка при оновленні модуля');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      await courseService.deleteModule(moduleId);

      setModules((prev) => prev.filter((m) => m.id !== moduleId));
      toast.success('Модуль успішно видалено!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Помилка при видаленні модуля');
    }
  };

  const handleDeleteModuleItem = async (item: ModuleItemData, moduleId: string) => {
    try {
      if (item.type === 'LINK' || item.type === 'THEORY') {
        await materialsService.deleteMaterial(item.id);
      } else if (item.type === 'TASK') {
        await tasksService.deleteTask(item.id);
      } else if (item.type === 'TEST') {
        await testsService.deleteTest(item.id);
      }

      setModules((prevModules) =>
        prevModules.map((mod) => {
          if (mod.id === moduleId) {
            return {
              ...mod,
              items: mod.items.filter((i) => i.id !== item.id),
            };
          }
          return mod;
        }),
      );

      toast.success('Елемент успішно видалено!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Помилка при видаленні елемента');
      console.error(err);
    }
  };

  const handleReadAnnouncement = async (announcementId: string) => {
    try {
      await announcementService.readAnnouncement(announcementId);

      setAnnouncements((prev) =>
        prev.map((ann) => (ann.id === announcementId ? { ...ann, isUnread: false } : ann)),
      );
    } catch (err) {
      console.error('Помилка при відмітці оголошення як прочитаного:', err);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      await announcementService.deleteAnnouncement(announcementId);

      setAnnouncements((prev) => prev.filter((ann) => ann.id !== announcementId));
      toast.success('Оголошення успішно видалено!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Помилка при видаленні оголошення');
      console.error(err);
    }
  };

  return {
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
  };
};
