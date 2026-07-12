import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTaskSidebarData } from '@/features/tasks/hooks/useTaskSidebarData';
import { toast } from '@/libs/configs/Toast';
import { isAxiosError } from 'axios';
import { formatToServerISO } from '@/libs/utils/date';
import { lessonsService } from '@/api/lessons.service';

export const useEditLessonForm = () => {
  const { id: courseId, lessonId } = useParams<{ id: string; lessonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { options, isLoading: isSidebarLoading } = useTaskSidebarData();

  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [module, setModule] = useState('');
  const [nusGroup, setNusGroup] = useState<string[]>([]);
  const [hideTask, setHideTask] = useState(false);

  const { data: lesson, isLoading: isLessonLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => lessonsService.getLessonById(lessonId!),
    enabled: !!lessonId,
  });

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '');
      setInstructions(lesson.description || '');
      setDueDate(lesson.date ? lesson.date.substring(0, 16) : '');
      setModule(lesson.courseModuleId || '');
      setHideTask(lesson.isHidden || false);

      let initialNusGroups: string[] = [];

      if ((lesson as any).nusGroups && Array.isArray((lesson as any).nusGroups)) {
        initialNusGroups = (lesson as any).nusGroups.map((group: any) => group.id);
      } else if ((lesson as any).nusGroupIds) {
        initialNusGroups = (lesson as any).nusGroupIds;
      } else if ((lesson as any).nusGroupId) {
        initialNusGroups = [(lesson as any).nusGroupId];
      }

      setNusGroup(initialNusGroups);
    }
  }, [lesson]);

  const updateLessonMutation = useMutation({
    mutationFn: (data: FormData) => lessonsService.updateLesson(lessonId!, data),
    onSuccess: () => {
      toast.success('Урок успішно оновлено');
      queryClient.invalidateQueries({ queryKey: ['course-content', courseId] });
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
      navigate(`/courses/${courseId}`);
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Помилка при оновленні уроку');
      } else {
        toast.error('Щось пішло не так');
      }
    },
  });

  const isFormValid = title.trim() !== '' && dueDate.trim() !== '' && module.trim() !== '';

  const handleSubmit = async () => {
    if (!isFormValid || !lessonId || !lesson) return;

    try {
      const formData = new FormData();

      if (courseId) formData.append('courseId', courseId);

      formData.append('title', title.trim());
      formData.append('description', instructions.trim() ? instructions.trim() : '');
      formData.append('date', dueDate ? formatToServerISO(dueDate) : '');

      if (module) {
        const isExistingModule = options.modules.some((opt) => opt.value === module);
        if (isExistingModule) {
          formData.append('courseModuleId', module);
        } else {
          formData.append('newModuleTitle', module);
        }
      } else {
        formData.append('courseModuleId', '');
      }

      if (nusGroup && nusGroup.length > 0) {
        nusGroup.forEach((groupId) => {
          formData.append('nusGroupIds', groupId);
        });
      }

      formData.append('isHidden', String(hideTask));

      updateLessonMutation.mutate(formData);
    } catch (error: any) {
      toast.error(error || 'Сталася помилка під час збереження форми');
    }
  };

  return {
    formState: {
      title,
      setTitle,
      instructions,
      setInstructions,
      dueDate,
      setDueDate,
      module,
      setModule,
      nusGroup,
      setNusGroup,
      hideTask,
      setHideTask,
    },
    options,
    isLoading: isSidebarLoading,
    isLessonLoading,
    isSubmitting: updateLessonMutation.isPending,
    isFormValid,
    handleSubmit,
  };
};
