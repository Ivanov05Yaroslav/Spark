import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTaskSidebarData } from '@/features/tasks/hooks/useTaskSidebarData';
import { toast } from '@/libs/configs/Toast';
import { isAxiosError } from 'axios';
import { formatToServerISO } from '@/libs/utils/date';
import { lessonsService } from '@/api/lessons.service';

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
    mutationFn: (data: FormData) => lessonsService.createLesson(data),
    onSuccess: () => {
      toast.success('Урок успішно створено');
      queryClient.invalidateQueries({ queryKey: ['course-content', courseId] });
      navigate(`/courses/${courseId}`);
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Помилка при створенні уроку');
      } else {
        toast.error('Щось пішло не так');
      }
    },
  });

  const isFormValid = title.trim() !== '' && dueDate.trim() !== '' && module.trim() !== '';

  const handleSubmit = async () => {
    if (!isFormValid || !courseId) return;

    try {
      const formData = new FormData();

      formData.append('courseId', courseId);

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

      createLessonMutation.mutate(formData);
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
    isLoading,
    isSubmitting: createLessonMutation.isPending,
    isFormValid,
    handleSubmit,
  };
};
