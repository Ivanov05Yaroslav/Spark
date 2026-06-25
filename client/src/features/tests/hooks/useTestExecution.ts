import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Додаємо навігацію
import { testsService } from '@/api/tests.service';
import { ApiTestDetailResponse } from '@/types/tests.types';
import { toast } from '@/libs/configs/Toast';
import { QuestionStatus } from '@/components/tests/QuestionNavCard/QuestionNavCard.tsx';

export const useTestExecution = (testId: string | undefined) => {
  const navigate = useNavigate();

  const [test, setTest] = useState<ApiTestDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Стан для сабміту
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Час початку тесту (в мілісекундах)
  const [startTime] = useState<number>(Date.now());

  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!testId) return;

    const fetchTest = async () => {
      try {
        setIsLoading(true);
        const data = await testsService.getTestById(testId);
        setTest(data);
      } catch (error: any) {
        const serverErrorMessage = error?.response?.data?.message || 'Не вдалося завантажити тест';
        toast.error(serverErrorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  const handleOptionToggle = (questionId: string, optionId: string, isMultiple: boolean) => {
    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];

      if (isMultiple) {
        if (currentAnswers.includes(optionId)) {
          return { ...prev, [questionId]: currentAnswers.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...currentAnswers, optionId] };
        }
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const handleNext = () => {
    if (test && currentIndex < test.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleQuestionNavClick = (id: string | number) => {
    if (!test) return;
    const index = test.questions.findIndex((q) => q.id === id);
    if (index !== -1) setCurrentIndex(index);
  };

  const handleFinishTest = async () => {
    if (!testId || !test) return;

    const durationInSeconds = Math.floor((Date.now() - startTime) / 1000);

    const formattedAnswers = Object.entries(answers).flatMap(([questionId, selectedOptions]) =>
      selectedOptions.map((answerId) => ({
        questionId,
        answerId,
      })),
    );

    const payload = {
      answers: formattedAnswers,
      duration: durationInSeconds,
    };

    try {
      setIsSubmitting(true);
      await testsService.submitTest(testId, payload);
      toast.success('Тест успішно завершено та збережено!');

      setTimeout(() => {
        navigate(`/courses/${test.courseId}/tests/${test.id}`);
      }, 1500);
    } catch (error: any) {
      console.error('Помилка при відправці тесту:', error);
      const serverErrorMessage =
        error?.response?.data?.message || 'Не вдалося відправити результати тесту';
      toast.error(serverErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    toast.info('Час вичерпано! Ваші відповіді збережено автоматично.');
    handleFinishTest();
  };

  const navItems = useMemo(() => {
    if (!test) return [];

    return test.questions.map((q, idx) => {
      let status: QuestionStatus = 'unanswered';

      if (idx === currentIndex) {
        status = 'active';
      } else if (answers[q.id] && answers[q.id].length > 0) {
        status = 'answered';
      }

      return {
        id: q.id,
        number: idx + 1,
        status,
      };
    });
  }, [test, currentIndex, answers]);

  const rawCurrentQuestion = test?.questions[currentIndex];

  const mappedCurrentQuestion = rawCurrentQuestion
    ? {
        id: rawCurrentQuestion.id,
        text: rawCurrentQuestion.content,
        type:
          rawCurrentQuestion.type === 'MULTIPLE_CHOICE'
            ? ('checkbox' as const)
            : ('radio' as const),
        points: rawCurrentQuestion.points,
        options: rawCurrentQuestion.answers.map((a) => ({
          id: a.id,
          label: a.content,
        })),
      }
    : null;

  return {
    test,
    isLoading,
    isSubmitting,
    currentIndex,
    answers,
    mappedCurrentQuestion,
    navItems,
    handleOptionToggle,
    handleNext,
    handlePrev,
    handleQuestionNavClick,
    handleFinishTest,
    handleTimeUp,
    isFirstQuestion: currentIndex === 0,
    isLastQuestion: test ? currentIndex === test.questions.length - 1 : false,
    initialTimeInSeconds: test ? test.timeLimitMinutes * 60 : 0,
  };
};
