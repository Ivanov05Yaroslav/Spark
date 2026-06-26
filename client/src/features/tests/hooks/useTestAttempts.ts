import { useState, useEffect, useMemo } from 'react';
import { submissionsService } from '@/api/submissions.service';
import { ApiTestAttemptsResponse } from '@/types/tests.types';
import { toast } from '@/libs/configs/Toast';
import { TestAttempt } from '@/features/tests/components/TestResultsTable/TestResultsTable';
import { formatToDateTime } from '@/libs/utils/date';

export const useTestAttempts = (testId: string | undefined) => {
  const [attemptsData, setAttemptsData] = useState<ApiTestAttemptsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!testId) return;

    const fetchAttempts = async () => {
      try {
        setIsLoading(true);
        const data = await submissionsService.getMyAttempts(testId);
        setAttemptsData(data);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Не вдалося завантажити спроби');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttempts();
  }, [testId]);

  const formattedAttempts: TestAttempt[] = useMemo(() => {
    if (!attemptsData) return [];

    return attemptsData.attempts.map((attempt) => {
      const minutes = Math.floor(attempt.duration / 60);
      const seconds = attempt.duration % 60;
      const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

      const formattedDate = formatToDateTime(attempt.submittedAt) || '-';

      return {
        id: attempt.id,
        number: attempt.attemptNumber,
        duration: formattedDuration,
        correctAnswers: null,
        wrongAnswers: null,
        completionDate: formattedDate,
        mark: Number(attempt.score),
        hasDetails: attempt.canReview,
      };
    });
  }, [attemptsData]);

  return { attemptsData, formattedAttempts, isLoading };
};
