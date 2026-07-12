import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTaskSidebarData } from '@/features/tasks/hooks/useTaskSidebarData';
import { toast } from '@/libs/configs/Toast';
import { isAxiosError } from 'axios';
import { formatToServerISO } from '@/libs/utils/date';
import { lessonsService } from '@/api/lessons.service';

interface CreateLessonDto {
  courseId: string;
  title: string;
  description: string;
  date: string;
  courseModuleId?: string;
  newModuleTitle?: string;
  nusGroupIds?: string[];
  isHidden: boolean;
}

export const useCreateLessonForm = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { options, isLoading } = useTaskSidebarData();

  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [module, setModule] = useState('');
  const [nusGroup, setNusGroup] = useState<string[]>([]);
  const [hideTask, setHideTask] = useState(false);

  const createLessonMutation = useMutation({
    mutationFn: (data: CreateLessonDto) => lessonsService.createLesson(data),
    onSuccess: () => {
      toast.success('Урок успішно створено');
      queryClient.invalidateQueries({ queryKey: ['course-content', courseId] });
      navigate(`/courses/${courseId}`);
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Помилка при створенні уроку');
      } else {
        toast.error('Сталася невідома помилка');
      }
    },
  });

  const isFormValid = title.trim() !== '' && dueDate.trim() !== '' && module.trim() !== '';

  const handleSubmit = async () => {
    if (!isFormValid || !courseId) return;

    try {
      const payload: CreateLessonDto = {
        courseId,
        title: title.trim(),
        description: instructions.trim() ? instructions.trim() : '',
        date: formatToServerISO(dueDate),
        isHidden: hideTask,
      };

      if (module) {
        const isExistingModule = options.modules.some((opt) => opt.value === module);
        if (isExistingModule) {
          payload.courseModuleId = module;
        } else {
          payload.newModuleTitle = module;
        }
      }

      if (nusGroup && nusGroup.length > 0) {
        payload.nusGroupIds = nusGroup;
      }

      createLessonMutation.mutate(payload);
    } catch (error: any) {
      toast.error(error?.message || 'Сталася помилка під час збереження форми');
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
    isLoading,
    isSubmitting: createLessonMutation.isPending,
    isFormValid,
    handleSubmit,
  };
};
