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

      const formattedComments: CommentProps[] = data.map((comment) => ({
        id: comment.id,
        isOwner: currentUser?.id === comment.authorId,
        author: {
          name: `${comment.author.firstName} ${comment.author.lastName}`,
          avatarUrl: comment.author.avatarUrl || 'https://www.w3schools.com/w3images/avatar2.png',
        },
        content: comment.content,
        timestamp: formatToDateTime(comment.createdAt) || '',
      }));

      setComments(formattedComments);
    } catch (error: any) {
      console.error('Помилка при завантаженні коментарів:', error);
      toast.error(error?.response?.data?.message || 'Не вдалося завантажити коментарі');
      setComments([]);
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
    console.log('Редагування коментаря:', id, 'Новий текст:', content);
    // TODO: Додати виклик API для редагування та зробити await fetchComments()
  };

  const complainComment = async (id: string) => {
    console.log('Скарга на коментар:', id);
    // TODO: Додати виклик API для скарги
  };

  return {
    comments,
    isLoading,
    isFetching,
    addComment,
    deleteComment,
    editComment,
    complainComment,
  };
};
