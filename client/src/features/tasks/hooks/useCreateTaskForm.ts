import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTaskSidebarData } from './useTaskSidebarData';
import { UploadedLink } from '@/types/tasks.types';
import { toast } from '@/libs/configs/Toast';
import { isAxiosError } from 'axios';
import { formatToServerISO } from '@/libs/utils/date';
import { tasksService } from '@/api/tasks.service';

export const useCreateTaskForm = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { options, defaultClassId, isLoading } = useTaskSidebarData();

  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [module, setModule] = useState('');
  const [nusGroup, setNusGroup] = useState('');
  const [hideTask, setHideTask] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [uploadedLinks, setUploadedLinks] = useState<UploadedLink[]>([]);
  const [isUploadLinkModalOpen, setIsUploadLinkModalOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('');

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => tasksService.createTask(data),
    onSuccess: () => {
      toast.success('Завдання успішно створено');
      queryClient.invalidateQueries({ queryKey: ['tasks', courseId] });
      navigate(`/courses/${courseId}/tasks`);
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Помилка при створенні завдання');
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
      formData.append('classId', defaultClassId || '');
      formData.append('title', title.trim());
      formData.append('description', instructions.trim() ? instructions.trim() : '');
      formData.append('deadline', dueDate ? formatToServerISO(dueDate) : '');

      if (module) {
        const isExistingModule = options.modules.some((opt) => opt.value === module);
        if (isExistingModule) {
          formData.append('courseModuleId', module);
        } else {
          formData.append('newModuleTitle', module);
        }
      }

      formData.append('nusGroupId', nusGroup ? nusGroup : '');
      formData.append('isHidden', String(hideTask));

      uploadedFiles.forEach((file) => {
        formData.append('files', file);
      });

      uploadedLinks.forEach((link) => {
        formData.append('links', link.url);
      });

      createTaskMutation.mutate(formData);
    } catch (error: any) {
      toast.error(error || 'Сталася помилка під час збереження форми');
    }
  };

  const handleFilesSelectFromModal = (newFiles: File[]) => setUploadedFiles(newFiles);
  const handleRemoveFile = (indexToRemove: number) =>
    setUploadedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkInput.trim()) {
      setUploadedLinks((prev) => [...prev, { url: linkInput.trim(), name: linkInput.trim() }]);
      setLinkInput('');
      setIsUploadLinkModalOpen(false);
    }
  };

  const handleRemoveLink = (indexToRemove: number) =>
    setUploadedLinks((prev) => prev.filter((_, index) => index !== indexToRemove));

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
      handleAddLink,
      handleRemoveLink,
    },
    options,
    isLoading,
    isSubmitting: createTaskMutation.isPending,
    isFormValid,
    handleSubmit,
  };
};
