import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '@/api/courses.service';
import { subjectsService } from '@/api/subjects.service';

export const useTaskSidebarData = () => {
  const { id: courseId } = useParams<{ id: string }>();

  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseService.getCourseById(courseId!),
    enabled: !!courseId,
  });

  const subjectId = course?.subject?.id || course?.subject.id;
  const classInfo = course?.class;

  const { data: modules, isLoading: isModulesLoading } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: () => courseService.getModulesByCourseId(courseId!),
    enabled: !!courseId,
  });

  const { data: nushGroups, isLoading: isNushLoading } = useQuery({
    queryKey: ['nush-groups', subjectId],
    queryFn: () => subjectsService.getGradingGroupsBySubject(String(subjectId)),
    enabled: !!subjectId,
  });

  const classOptions = classInfo ? [{ value: String(classInfo.id), label: classInfo.name }] : [];

  const moduleOptions =
    modules?.map((m) => ({
      value: String(m.id),
      label: m.title,
    })) || [];

  const nushGroupOptions =
    nushGroups?.map((g) => ({
      value: String(g.id),
      label: g.name,
    })) || [];

  const subjectInfo = course?.subject;
  const subjectOption = subjectInfo
    ? { value: String(subjectInfo.id), label: subjectInfo.name }
    : null;

  return {
    options: {
      classes: classOptions,
      subject: subjectOption,
      modules: moduleOptions,
      gradingGroups: nushGroupOptions,
    },
    defaultClassId: classInfo ? String(classInfo.id) : null,
    isLoading: isCourseLoading || isModulesLoading || isNushLoading,
  };
};
