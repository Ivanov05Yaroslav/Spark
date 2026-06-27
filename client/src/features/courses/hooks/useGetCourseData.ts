import { useState, useEffect } from 'react';
import { courseService } from '@/api/courses.service';
import { CourseDetailResponseDto, CourseUserDto } from '@/types/courses.types';
import { ModuleData } from '@/features/courses/components/ModuleList/ModuleList';
import { ParticipantData } from '@/components/courses/ParticipantCard/ParticipantCard';
import { DetailedAnnouncement } from '@/features/announcements/components/AnnouncementsWorkspace/AnnouncementsWorkspace';
import { OnlineLessonLink } from '@/features/courses/components/OnlineLessonsBlock/OnlineLessonsBlock';
import { toast } from '@/libs/configs/Toast';

const getFullName = (user: CourseUserDto) => `${user.firstName} ${user.lastName}`.trim();

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const useGetCourseData = (courseId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<CourseDetailResponseDto | null>(null);

  const [modules, setModules] = useState<ModuleData[]>([]);
  const [participants, setParticipants] = useState<{
    teachers: ParticipantData[];
    coTeachers: ParticipantData[];
    homeroom: ParticipantData[];
    students: ParticipantData[];
  }>({ teachers: [], coTeachers: [], homeroom: [], students: [] });
  const [announcements, setAnnouncements] = useState<DetailedAnnouncement[]>([]);

  const [lessons, setLessons] = useState<OnlineLessonLink[]>([]);
  const [unreadAnnouncementsCount, setUnreadAnnouncementsCount] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = (await courseService.getCourseById(
          courseId,
        )) as unknown as CourseDetailResponseDto;
        setRawData(data);

        setLessons(
          data.videoLinks?.map((v: any) => ({
            id: v.id,
            title: v.title || 'Відеоурок',
            url: v.url,
          })) || [],
        );
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

    try {
      await courseService.updateVideoLinks(
        courseId,
        newLessons.map((l) => l.url),
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Посилання успішно додано!');
      setLessons(newLessons);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Помилка при додаванні посилання на сервері');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLessons(lessons);
    }
  };

  const handleEditLesson = async (id: string, newUrl: string) => {
    const newLessons = lessons.map((link) => (link.id === id ? { ...link, url: newUrl } : link));

    try {
      await courseService.updateVideoLinks(
        courseId,
        newLessons.map((l) => l.url),
      );
      toast.success('Посилання успішно оновлено!');
      setLessons(newLessons);
    } catch (err: any) {
      console.error('Помилка при редагуванні посилання:', err);
      toast.error(err?.response?.data?.message || 'Помилка при збереженні змін на сервері');
      setLessons(lessons);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    const newLessons = lessons.filter((link) => link.id !== id);

    try {
      await courseService.updateVideoLinks(
        courseId,
        newLessons.map((l) => l.url),
      );
      toast.success('Посилання успішно видалено!');
      setLessons(newLessons);
    } catch (err: any) {
      console.error('Помилка при видаленні посилання:', err);
      toast.error(err?.response?.data?.message || 'Помилка при видаленні посилання на сервері');
      setLessons(lessons);
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
    handleAddLesson,
    handleEditLesson,
    handleDeleteLesson,
  };
};
