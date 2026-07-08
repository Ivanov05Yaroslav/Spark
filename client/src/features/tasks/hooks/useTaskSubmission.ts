import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from '@/libs/configs/Toast';
import { submissionsService } from '@/api/submissions.service';
import { useStore } from '@/stores/useStore.ts';

export interface SubmittedFile {
  id: string;
  name: string;
  url?: string;
}

export const useTaskSubmission = (
  initialStatus: 'Assigned' | 'Turned in' | 'Graded' | 'Missing' = 'Assigned',
) => {
  const { taskId } = useParams<{ taskId: string }>();
  const user = useStore((state) => state.user);

  const [submissionStatus, setSubmissionStatus] = useState<
    'Assigned' | 'Turned in' | 'Graded' | 'Missing'
  >(initialStatus);
  const [grade, setGrade] = useState<string | number>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const [serverAttachments, setServerAttachments] = useState<SubmittedFile[]>([]);
  const [initialAttachmentsCount, setInitialAttachmentsCount] = useState<number>(0);

  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [localLinks, setLocalLinks] = useState<string[]>([]);

  const fetchExistingSubmission = useCallback(async () => {
    if (!taskId) return;

    try {
      const userId = user?.id;
      const submission = await submissionsService.getStudentSubmissionDetail(taskId!, userId!);

      if (submission) {
        setSubmissionId(submission.id);

        if (submission.score !== null) {
          setSubmissionStatus('Graded');
          setGrade(submission.score);
        } else {
          setSubmissionStatus('Turned in');
        }

        if (submission.attachments && submission.attachments.length > 0) {
          const parsedAttachments = submission.attachments.map((url: string, index: number) => {
            const fileName = url.split('/').pop() || `Attachment ${index + 1}`;
            return {
              id: `server-${index}`,
              name: fileName,
              url,
            };
          });
          setServerAttachments(parsedAttachments);
          setInitialAttachmentsCount(parsedAttachments.length);
        } else {
          setServerAttachments([]);
          setInitialAttachmentsCount(0);
        }
      }
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error('Помилка завантаження роботи:', error);
      }
    }
  }, [taskId]);

  useEffect(() => {
    fetchExistingSubmission();
  }, [fetchExistingSubmission]);

  const formattedFiles: SubmittedFile[] = [
    ...serverAttachments,
    ...localFiles.map((file, index) => ({
      id: `file-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
    })),
    ...localLinks.map((link, index) => ({
      id: `link-${index}`,
      name: link,
      url: link,
    })),
  ];

  useEffect(() => {
    return () => {
      localFiles.forEach((file, index) => {
        const url = formattedFiles.find((f) => f.id === `file-${index}`)?.url;
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [localFiles, formattedFiles]);

  const handleAddFile = (file: File) => setLocalFiles((prev) => [...prev, file]);
  const handleAddLink = (link: string) => setLocalLinks((prev) => [...prev, link]);

  const handleRemoveFileOrLink = (id: string) => {
    if (id.startsWith('server-')) {
      setServerAttachments((prev) => prev.filter((att) => att.id !== id));
    } else if (id.startsWith('file-')) {
      const index = parseInt(id.replace('file-', ''), 10);
      setLocalFiles((prev) => prev.filter((_, i) => i !== index));
    } else if (id.startsWith('link-')) {
      const index = parseInt(id.replace('link-', ''), 10);
      setLocalLinks((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmitWork = async () => {
    if (!taskId) return;

    if (submissionStatus === 'Turned in') {
      try {
        setIsSubmitting(true);
        setSubmissionStatus('Assigned');
        toast.success('Здачу скасовано. Тепер ви можете змінити файли.');
      } catch (error: any) {
        console.error('Помилка під час скасування здачі:', error);
        toast.error(error?.response?.data?.message || 'Не вдалося скасувати здачу');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('taskId', taskId);

      localFiles.forEach((file) => {
        formData.append('files', file);
      });

      localLinks.forEach((link) => {
        formData.append('links[]', link);
      });

      const isOldAttachmentsModified = serverAttachments.length !== initialAttachmentsCount;

      if (isOldAttachmentsModified) {
        if (serverAttachments.length === 0) {
          formData.append('retainedAttachments', '');
        } else {
          serverAttachments.forEach((att) => {
            if (att.url) {
              formData.append('retainedAttachments[]', att.url);
            }
          });
        }
      }

      if (submissionId) {
        await submissionsService.patchTaskSubmission(submissionId, formData);
      } else {
        await submissionsService.submitTask(formData);
      }

      toast.success('Завдання успішно збережено!');

      setLocalFiles([]);
      setLocalLinks([]);

      await fetchExistingSubmission();
    } catch (error: any) {
      console.error('Помилка під час здачі завдання:', error);
      toast.error(error?.response?.data?.message || 'Не вдалося зберегти завдання');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submissionStatus,
    setSubmissionStatus,
    grade,
    setGrade,
    isSubmitting,
    submittedFiles: formattedFiles,
    onAddFile: handleAddFile,
    onAddLink: handleAddLink,
    onRemoveFile: handleRemoveFileOrLink,
    onSubmitWork: handleSubmitWork,
  };
};
