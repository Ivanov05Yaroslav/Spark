import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTaskSidebarData } from './useTaskSidebarData';
import { UploadedLink } from '@/types/tasks.types';
import { toast } from '@/libs/configs/Toast';
import { isAxiosError } from 'axios';
import { formatToServerISO } from '@/libs/utils/date';
import { tasksService } from '@/api/tasks.service';
import { TaskResponse } from '@/types/tasks.types';

type EditFormLink = UploadedLink & { isExisting?: boolean };

export const useEditTaskForm = () => {
  const { id: courseId, taskId } = useParams<{ id: string; taskId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { options, isLoading: isSidebarLoading } = useTaskSidebarData();

  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [module, setModule] = useState('');
  const [nusGroup, setNusGroup] = useState('');
  const [hideTask, setHideTask] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [uploadedLinks, setUploadedLinks] = useState<EditFormLink[]>([]);
  const [isUploadLinkModalOpen, setIsUploadLinkModalOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [linkNameInput, setLinkNameInput] = useState('');

  const { data: task, isLoading: isTaskLoading } = useQuery<TaskResponse>({
    queryKey: ['task', taskId],
    queryFn: () => tasksService.getTaskById(taskId!),
    enabled: !!taskId,
  });

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setInstructions(task.description || '');
      setDueDate(task.deadline ? task.deadline.substring(0, 16) : '');
      setModule(task.courseModuleId || '');
      setNusGroup(task.nusGroupId || '');
      setHideTask(task.isHidden || false);

      const existingAttachments: EditFormLink[] = (task.attachments || []).map((url) => {
        const fileName = url.substring(url.lastIndexOf('/') + 1);
        return {
          url: url,
          name: fileName || url,
          isExisting: true,
        };
      });
      setUploadedLinks(existingAttachments);
    }
  }, [task]);

  const updateTaskMutation = useMutation({
    mutationFn: (data: FormData) => tasksService.updateTask(taskId!, data),
    onSuccess: () => {
      toast.success('Завдання успішно оновлено');
      queryClient.invalidateQueries({ queryKey: ['tasks', courseId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      navigate(`/courses/${courseId}/tasks`);
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
    if (!isFormValid || !taskId || !task) return;

    try {
      const formData = new FormData();

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
      } else {
        formData.append('courseModuleId', '');
      }

      formData.append('nusGroupId', nusGroup ? nusGroup : '');
      formData.append('isHidden', String(hideTask));

      const originalAttachments = task.attachments || [];
      const retainedAttachments = uploadedLinks
        .filter((link) => link.isExisting)
        .map((link) => link.url);

      const hasAttachmentsChanged =
        originalAttachments.length !== retainedAttachments.length ||
        !originalAttachments.every((url) => retainedAttachments.includes(url));

      if (hasAttachmentsChanged) {
        if (retainedAttachments.length === 0) {
          formData.append('retainedAttachments', '');
        } else {
          retainedAttachments.forEach((url) => {
            formData.append('retainedAttachments', url);
          });
        }
      }

      const newLinks = uploadedLinks.filter((link) => !link.isExisting);
      newLinks.forEach((link) => {
        formData.append('links', link.url);
      });

      uploadedFiles.forEach((file) => {
        formData.append('files', file);
      });

      updateTaskMutation.mutate(formData);
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
    isSubmitting: updateTaskMutation.isPending,
    isFormValid,
    handleSubmit,
  };
};
