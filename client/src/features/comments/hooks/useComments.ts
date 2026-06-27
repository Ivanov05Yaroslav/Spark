import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/libs/configs/Toast';
import { commentsService } from '@/api/comments.service';
import { CommentProps } from '@/components/comments/CommentItem/CommentItem';
import { formatToDateTime } from '@/libs/utils/date';
import { useStore } from '@/stores/useStore';

interface UseCommentsProps {
  testId?: string;
  taskId?: string;
  targetStudentId?: string;
}

export const useComments = ({ testId, taskId, targetStudentId }: UseCommentsProps) => {
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const currentUser = useStore((state) => state.user);

  const fetchComments = useCallback(async () => {
    if (!testId && !taskId) return;

    try {
      setIsFetching(true);
      let data: any[] = [];

      const params = targetStudentId ? { targetStudentId } : undefined;

      if (testId) {
        data = await commentsService.getTestComments(testId, params);
      } else if (taskId) {
        data = await commentsService.getTaskComments(taskId, params);
      }

      const now = Date.now();
      const EDIT_WINDOW_MS = 30 * 60 * 1000; // 30 хвилин у мілісекундах

      const formattedComments: CommentProps[] = data.map((comment) => {
        const isOwner = currentUser?.id === comment.authorId;
        const commentTime = new Date(comment.createdAt).getTime();
        const isEditable = isOwner && now - commentTime < EDIT_WINDOW_MS;

        return {
          id: comment.id,
          isOwner,
          isEditable,
          author: {
            name: `${comment.author.firstName} ${comment.author.lastName}`,
            avatarUrl: comment.author.avatarUrl || '',
          },
          timestamp: formatToDateTime(comment.createdAt) || '',
          content: comment.content,
        };
      });

      setComments(formattedComments);
    } catch (error) {
      console.error('Помилка завантаження коментарів:', error);
    } finally {
      setIsFetching(false);
    }
  }, [testId, taskId, targetStudentId, currentUser?.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string) => {
    if (!content.trim()) return;

    try {
      setIsLoading(true);

      const payload = {
        content,
        ...(testId && { testId }),
        ...(taskId && { taskId }),
        ...(targetStudentId && { targetStudentId }),
      };

      await commentsService.createComment(payload);
      toast.success('Коментар додано');
      await fetchComments();
    } catch (error: any) {
      console.error('Помилка при відправці коментаря:', error);
      toast.error(error?.response?.data?.message || 'Не вдалося відправити коментар');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteComment = async (id: string) => {
    try {
      await commentsService.deleteComment(id);
      toast.success('Коментар успішно видалено');
      await fetchComments();
    } catch (error: any) {
      console.error('Помилка при видаленні коментаря:', error);
      toast.error(error?.response?.data?.message || 'Не вдалося видалити коментар');
    }
  };

  const editComment = async (id: string, content: string) => {
    if (!content.trim()) return;

    try {
      await commentsService.updateComment(id, content);
      toast.success('Коментар успішно відредаговано');
      await fetchComments();
    } catch (error: any) {
      console.error('Помилка при редагуванні коментаря:', error);
      toast.error(error?.response?.data?.message || 'Не вдалося відредагувати коментар');
    }
  };

  const complainComment = async (id: string, reason: string) => {
    try {
      await commentsService.reportComment(id, reason);
      toast.success('Скаргу успішно відправлено');
    } catch (error: any) {
      console.error('Помилка при відправці скарги:', error);
      toast.error(error?.response?.data?.message || 'Не вдалося відправити скаргу');
    }
  };

  return {
    comments,
    isLoading,
    isFetching,
    addComment,
    editComment,
    deleteComment,
    complainComment,
  };
};
