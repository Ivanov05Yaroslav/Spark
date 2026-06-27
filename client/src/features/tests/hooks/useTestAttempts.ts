import { useState, useEffect, useMemo } from 'react';
import { submissionsService } from '@/api/submissions.service';
import { ApiTestAttemptsResponse } from '@/types/tests.types';
import { toast } from '@/libs/configs/Toast';
import { TestAttempt } from '@/features/tests/components/TestResultsTable/TestResultsTable';
import { formatToDateTime } from '@/libs/utils/date';
import { useStore } from '@/stores/useStore';

export const useTestAttempts = (testId: string | undefined, targetStudentId?: string) => {
  const [attemptsData, setAttemptsData] = useState<ApiTestAttemptsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const user = useStore((state) => state.user);
  const isStudent = user?.roles.includes('STUDENT');

  const studentIdToFetch = isStudent ? user?.id : targetStudentId;

  useEffect(() => {
    if (!testId || !studentIdToFetch) {
      setIsLoading(false);
      return;
    }

    const fetchAttempts = async () => {
      try {
        setIsLoading(true);
        const data = await submissionsService.getAttempts(testId, studentIdToFetch);
        setAttemptsData(data);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Не вдалося завантажити спроби');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttempts();
  }, [testId, studentIdToFetch]);

  const formattedAttempts: TestAttempt[] = useMemo(() => {
    if (!attemptsData || !attemptsData.attempts) return [];

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

  return {
    attemptsData: attemptsData
      ? {
          ...attemptsData,
          attempts: formattedAttempts,
        }
      : null,
    formattedAttempts,
    isLoading,
  };
};
