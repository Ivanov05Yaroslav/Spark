import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTaskSidebarData } from './useTaskSidebarData';
import { UploadedLink } from '@/types/tasks.types';
import { toast } from '@/libs/configs/Toast';
import { isAxiosError } from 'axios';
import { formatToServerISO } from '@/libs/utils/date';
import { tasksService } from '@/api/tasks.service';
import { lessonsService } from '@/api/lessons.service'; // 👈 ДОДАНО ІМПОРТ

type EditFormLink = UploadedLink & { isExisting?: boolean };

export const useEditTaskForm = () => {
  const { id: courseId, taskId } = useParams<{ id: string; taskId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();
  const urlLessonId = searchParams.get('lessonId');
  const urlLessonTitle = searchParams.get('lessonTitle');

  const { options, isLoading: isSidebarLoading } = useTaskSidebarData();

  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [module, setModule] = useState('');
  const [nusGroup, setNusGroup] = useState<string[]>([]);
  const [hideTask, setHideTask] = useState(false);

  const [lessonId, setLessonId] = useState(urlLessonId || '');
  const [lessonTitle, setLessonTitle] = useState(urlLessonTitle || '');

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [uploadedLinks, setUploadedLinks] = useState<EditFormLink[]>([]);
  const [isUploadLinkModalOpen, setIsUploadLinkModalOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [linkNameInput, setLinkNameInput] = useState('');

  const { data: taskData, isLoading: isTaskLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksService.getTaskById(taskId!),
    enabled: !!taskId,
  });

  useEffect(() => {
    if (taskData) {
      setTitle(taskData.title || '');
      setInstructions(taskData.description || '');

      if (taskData.deadline) {
        setDueDate(taskData.deadline);
      }
      if (taskData.courseModuleId) {
        setModule(taskData.courseModuleId);
      }
      if (taskData.nusGroupId) {
        setNusGroup(
          Array.isArray(taskData.nusGroupId) ? taskData.nusGroupId : [taskData.nusGroupId],
        );
      }
      if (taskData.isHidden !== undefined) {
        setHideTask(taskData.isHidden);
      }

      if (!urlLessonId && taskData.lesson.id) {
        setLessonId(taskData.lesson.id);
      }
    }
  }, [taskData, urlLessonId]);

  const { data: lessonData } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => lessonsService.getLessonById(lessonId),
    enabled: !!lessonId && !urlLessonTitle,
  });

  useEffect(() => {
    if (lessonData) {
      setLessonTitle(lessonData.title || '');
    }
  }, [lessonData]);

  const editTaskMutation = useMutation({
    mutationFn: (data: FormData) => tasksService.updateTask(taskId!, data),
    onSuccess: () => {
      toast.success('Завдання успішно оновлено');
      queryClient.invalidateQueries({ queryKey: ['tasks', courseId] });
      navigate(`/courses/${courseId}`);
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Помилка при оновленні завдання');
      } else {
        toast.error('Щось пішло не так');
      }
    },
  });

  const isFormValid = title.trim() !== '' && dueDate.trim() !== '' && module.trim() !== '';

  const handleSubmit = async () => {
    if (!isFormValid) return;

    try {
      const formData = new FormData();
      formData.append('courseId', courseId!);
      formData.append('title', title.trim());
      formData.append('description', instructions.trim() ? instructions.trim() : '');
      formData.append('deadline', dueDate ? formatToServerISO(dueDate) : '');

      if (lessonId) {
        formData.append('lessonId', lessonId);
      }

      if (module) {
        const isExistingModule = options.modules.some((opt) => opt.value === module);
        if (isExistingModule) {
          formData.append('courseModuleId', module);
        } else {
          formData.append('newModuleTitle', module);
        }
      }

      if (nusGroup && nusGroup.length > 0) {
        nusGroup.forEach((groupId) => {
          formData.append('nusGroupIds', groupId);
        });
      }
      formData.append('isHidden', String(hideTask));

      uploadedFiles.forEach((file) => {
        formData.append('files', file);
      });

      uploadedLinks.forEach((link) => {
        if (!link.isExisting) {
          formData.append('links', link.url);
        }
      });

      editTaskMutation.mutate(formData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Сталася помилка під час збереження форми');
      } else {
        toast.error('Сталася невідома помилка під час збереження форми');
      }
    }
  };

  const handleFilesSelectFromModal = (newFiles: File[]) => setUploadedFiles(newFiles);
  const handleRemoveFile = (indexToRemove: number) =>
    setUploadedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkInput.trim()) {
      const displayName = linkNameInput.trim() || linkInput.trim();
      setUploadedLinks((prev) => [...prev, { url: linkInput.trim(), name: displayName }]);
      setLinkInput('');
      setLinkNameInput('');
      setIsUploadLinkModalOpen(false);
    }
  };

  const handleRemoveLink = (indexToRemove: number) =>
    setUploadedLinks((prev) => prev.filter((_, index) => index !== indexToRemove));

  return {
    formState: {
      title,
      setTitle,
      lessonTitle,
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
    filesState: {
      uploadedFiles,
      setUploadedFiles,
      isUploadModalOpen,
      setIsUploadModalOpen,
      handleFilesSelectFromModal,
      handleRemoveFile,
    },
    linksState: {
      uploadedLinks,
      setUploadedLinks,
      isUploadLinkModalOpen,
      setIsUploadLinkModalOpen,
      linkInput,
      setLinkInput,
      linkNameInput,
      setLinkNameInput,
      handleAddLink,
      handleRemoveLink,
    },
    options,
    isLoading: isSidebarLoading,
    isTaskLoading,
    isSubmitting: editTaskMutation.isPending,
    isFormValid,
    handleSubmit,
  };
};
