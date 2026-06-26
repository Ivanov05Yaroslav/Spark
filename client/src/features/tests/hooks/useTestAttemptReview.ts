import { useState, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';
import { toast } from '@/libs/configs/Toast';
import { TestAttemptReviewResponse } from '@/types/tests.types.ts';

export const useTestAttemptReview = (attemptId: string | undefined) => {
  const [reviewData, setReviewData] = useState<TestAttemptReviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!attemptId) return;

    const fetchReview = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/submissions/test-attempt/${attemptId}/review`);
        setReviewData(response.data);
      } catch (error: any) {
        console.error('Ошибка загрузки просмотра теста:', error);
        toast.error(error?.response?.data?.message || 'Не вдалося завантажити результати спроби');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReview();
  }, [attemptId]);

  return { reviewData, isLoading };
};
