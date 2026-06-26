import { useState, useEffect, useMemo } from 'react';
import { testsService } from '@/api/tests.service';
import { ApiTestDetailResponse } from '@/types/tests.types';
import { toast } from '@/libs/configs/Toast';
import { formatToDateTime } from '@/libs/utils/date';

export const useTestOverview = (testId: string | undefined) => {
  const [test, setTest] = useState<ApiTestDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!testId) return;

    const fetchTest = async () => {
      try {
        setIsLoading(true);
        const data = await testsService.getTestById(testId);
        setTest(data);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Не вдалося завантажити деталі тесту');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  const overviewData = useMemo(() => {
    if (!test) return null;

    const formattedDate = formatToDateTime(test.deadline) || 'Без обмежень';

    return {
      title: test.title,
      duration: `${test.timeLimitMinutes} хвилин`,
      attemptsAllowed: test.maxAttempts,
      questionsCount: test.questions.length,
      dueDate: formattedDate,
    };
  }, [test]);

  return { test, overviewData, isLoading };
};
