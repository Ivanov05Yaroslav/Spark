import { useState, useEffect } from 'react';
import { TaskResponse } from '@/types/tasks.types';
import { tasksService } from '@/api/tasks.service';
import { toast } from '@/libs/configs/Toast';

export const useTaskInstructions = (taskId: string | undefined) => {
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaskInstructions = async () => {
      if (!taskId) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await tasksService.getTaskById(taskId);
        setTask(data);
      } catch (err: any) {
        toast.error(err || 'Сталася помилка при загрузці курсу');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskInstructions();
  }, [taskId]);

  return { task, isLoading, error };
};
