import { useState, useEffect } from 'react';
import { courseService } from '@/api/courses.service';
import { subjectsService } from '@/api/subjects.service';
import { CourseDetailDto } from '@/types/courses.types';
import { ModuleDto } from '@/types/modules.types';
import { NushGradingGroupDto } from '@/types/subjects.types';

export const useTestSettingsSidebarData = (courseId: string | undefined) => {
  const [courseInfo, setCourseInfo] = useState<CourseDetailDto | null>(null);
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [nusGroups, setNusGroups] = useState<NushGradingGroupDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [title, setTitle] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [deadline, setDeadline] = useState('');
  const [attempts, setAttempts] = useState('1');
  const [moduleId, setModuleId] = useState('');
  const [nusGroupId, setNusGroupId] = useState('');
  const [isHidden, setIsHidden] = useState(false);
  const [isResultHidden, setIsResultHidden] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    const fetchAllData = async () => {
      try {
        setIsLoading(true);

        const course = await courseService.getCourseById(courseId);
        setCourseInfo(course);

        const courseModules = await courseService.getModulesByCourseId(courseId);
        setModules(courseModules || []);

        if (course.subjectId) {
          const groups = await subjectsService.getGradingGroupsBySubject(course.subjectId);
          setNusGroups(groups);
        }
      } catch (error) {
        console.error('Помилка при завантаженні даних для сайдбару:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [courseId]);

  return {
    modules,
    nusGroups,
    isLoading,
    subjectName: courseInfo?.subject?.name,
    courseClassName: courseInfo?.class?.name,

    title,
    setTitle,
    hours,
    setHours,
    minutes,
    setMinutes,
    deadline,
    setDeadline,
    attempts,
    setAttempts,
    moduleId,
    setModuleId,
    nusGroupId,
    setNusGroupId,
    isHidden,
    setIsHidden,
    isResultHidden,
    setIsResultHidden,
  };
};
