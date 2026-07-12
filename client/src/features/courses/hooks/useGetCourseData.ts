import { useState, useEffect, useCallback } from 'react';
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
import { lessonsService } from '@/api/lessons.service.ts';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface CourseTaskDto {
  id: string;
  title: string;
  deadline?: string;
}

interface CourseLessonDto {
  id: string;
  title: string;
  description?: string;
  date?: string;
  task?: CourseTaskDto | null;
  test?: CourseTaskDto | null;
}

interface CourseMaterialDto {
  id: string;
  title: string;
  fileUrl?: string | null;
  linkUrl?: string | null;
  createdAt?: string;
}

interface CourseModuleDto {
  id: string;
  title: string;
  lessons?: CourseLessonDto[];
  materials?: CourseMaterialDto[];
}

interface CourseAnnouncementDto {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isNew: boolean;
  creator: CourseUserDto;
}

const getFullName = (user: CourseUserDto | null | undefined) => {
  if (!user) return 'Невідомий користувач';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim();
};

const toParticipant = (
  user: CourseUserDto,
  role: ParticipantRole,
  classGroup?: string,
): ParticipantData => ({
  id: user.id,
  name: getFullName(user),
  role: role,
  avatarUrl: user.avatarUrl,
  classGroup: classGroup,
});

export const useGetCourseData = (courseId: string | undefined) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rawData, setRawData] = useState<CourseDetailResponseDto | null>(null);

  const [modules, setModules] = useState<ModuleData[]>([]);
  const [taskModules, setTaskModules] = useState<ModuleData[]>([]);

  const [participants, setParticipants] = useState<{
    teachers: ParticipantData[];
    coTeachers: ParticipantData[];
    classHomeroomTeacher: ParticipantData | null;
    students: ParticipantData[];
  }>({
    teachers: [],
    coTeachers: [],
    classHomeroomTeacher: null,
    students: [],
  });

  const [announcements, setAnnouncements] = useState<DetailedAnnouncement[]>([]);
  const [lessons, setLessons] = useState<OnlineLessonLink[]>([]);
  const [unreadAnnouncementsCount, setUnreadAnnouncementsCount] = useState(0);
  const [unsubmittedWorksCount, setUnsubmittedWorksCount] = useState(0);

  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const course = await courseService.getCourseById(courseId);
      setRawData(course);

      const mappedModules: ModuleData[] = (
        (course.modules as unknown as CourseModuleDto[]) || []
      ).map((mod: CourseModuleDto) => {
        const items: ModuleItemData[] = [];

        if (mod.lessons) {
          mod.lessons.forEach((lesson: CourseLessonDto) => {
            const lessonTasks = lesson.task
              ? [{ id: lesson.task.id, title: lesson.task.title }]
              : [];
            const lessonTests = lesson.test
              ? [{ id: lesson.test.id, title: lesson.test.title }]
              : [];

            items.push({
              id: lesson.id,
              type: 'LESSON',
              title: lesson.title,
              description: lesson.description,
              date: lesson.date,
              tasks: lessonTasks,
              tests: lessonTests,
            });
          });
        }

        if (mod.materials) {
          mod.materials.forEach((mat: CourseMaterialDto) => {
            items.push({
              id: mat.id,
              type: mat.linkUrl ? 'LINK' : 'THEORY',
              title: mat.title,
              fileUrl: mat.fileUrl,
              linkUrl: mat.linkUrl,
              date: mat.createdAt,
            });
          });
        }

        return { id: mod.id, title: mod.title, items };
      });

      const mappedTaskModules: ModuleData[] = (
        (course.modules as unknown as CourseModuleDto[]) || []
      )
        .map((mod: CourseModuleDto) => {
          const items: ModuleItemData[] = [];

          if (mod.lessons) {
            mod.lessons.forEach((lesson: CourseLessonDto) => {
              if (lesson.task) {
                items.push({
                  id: lesson.task.id,
                  type: 'TASK',
                  title: lesson.task.title,
                  date: lesson.task.deadline || lesson.date,
                });
              }
              if (lesson.test) {
                items.push({
                  id: lesson.test.id,
                  type: 'TEST',
                  title: lesson.test.title,
                  date: lesson.test.deadline || lesson.date,
                });
              }
            });
          }
          return { id: mod.id, title: mod.title, items };
        })
        .filter((mod) => mod.items.length > 0);

      setModules(mappedModules);
      setTaskModules(mappedTaskModules);

      setParticipants({
        teachers: course.participants?.creator
          ? [toParticipant(course.participants.creator, 'Викладач' as ParticipantRole)]
          : [],
        coTeachers: (course.participants?.coTeachers || []).map((t: CourseUserDto) =>
          toParticipant(t, 'Викладач' as ParticipantRole),
        ),
        classHomeroomTeacher: course.participants?.homeroomTeacher
          ? toParticipant(
              course.participants.homeroomTeacher,
              'Класний керівник' as ParticipantRole,
              course.class?.name,
            )
          : null,
        students: (course.participants?.students || []).map((s: CourseUserDto) =>
          toParticipant(s, 'Студент' as ParticipantRole, course.class?.name),
        ),
      });

      const mappedAnnouncements: DetailedAnnouncement[] = (
        (course.announcements as unknown as CourseAnnouncementDto[]) || []
      ).map((ann) => {
        const authorFullName = ann.creator
          ? `${ann.creator.firstName || ''} ${ann.creator.lastName || ''}`.trim()
          : 'Невідомий автор';

        return {
          id: ann.id,
          authorName: authorFullName,
          announcementTitle: ann.title,
          time: ann.createdAt,
          content: ann.content,
          avatarUrl: ann.creator?.avatarUrl,
          isUnread: ann.isNew,
        } as unknown as DetailedAnnouncement;
      });

      setAnnouncements(mappedAnnouncements);
      setUnreadAnnouncementsCount(course.unreadAnnouncementsCount || 0);
      setUnsubmittedWorksCount(course.unsubmittedWorksCount || 0);

      const mappedLessons = (course.videoLinks || []).map((link: string, idx: number) => ({
        id: `link-${idx}`,
        url: link,
      }));
      setLessons(mappedLessons);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError?.response?.data?.message || 'Помилка при завантаженні курсу');
      toast.error('Не вдалося завантажити дані курсу');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const handleDeleteModuleItem = async (item: ModuleItemData) => {
    try {
      if (item.type === 'LESSON') await lessonsService.deleteLesson(item.id);
      else if (item.type === 'TASK') await tasksService.deleteTask(item.id);
      else if (item.type === 'TEST') await testsService.deleteTest(item.id);
      else await materialsService.deleteMaterial(item.id);

      toast.success('Елемент успішно видалено!');
      fetchCourseData();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      toast.error(apiError?.response?.data?.message || 'Помилка при видаленні елемента');
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
    } catch (err: unknown) {
      const apiError = err as ApiError;
      toast.error(apiError?.response?.data?.message || 'Помилка при видаленні оголошення');
    }
  };

  const handleAddLesson = async (url: string) => {
    if (!courseId) return;
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
    if (!courseId) return;
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
    if (!courseId) return;
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

  return {
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
    refetch: fetchCourseData,
  };
};
