import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/libs/configs/Toast';
import { courseService } from '@/api/courses.service';
import { subjectsService } from '@/api/subjects.service';
import { testsService } from '@/api/tests.service';
import { CourseDetailResponseDto } from '@/types/courses.types';
import { ModuleDto } from '@/types/modules.types';
import { NushGradingGroupDto } from '@/types/subjects.types';
import { UIQuestion } from '@/types/tests.types.ts';

const UUID_REGEXP = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const useEditTestForm = (testId: string | undefined, courseId: string | undefined) => {
  const navigate = useNavigate();

  const [courseInfo, setCourseInfo] = useState<CourseDetailResponseDto | null>(null);
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [nusGroups, setNusGroups] = useState<NushGradingGroupDto[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [title, setTitle] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [deadline, setDeadline] = useState('');
  const [attempts, setAttempts] = useState('1');
  const [moduleId, setModuleId] = useState('');
  const [nusGroupId, setNusGroupId] = useState('');

  const [isHidden, setIsHidden] = useState(false);
  const [isResultHidden, setIsResultHidden] = useState(false);
  const [isAttemptHidden, setIsAttemptHidden] = useState(false);
  const [isShowCorrectAnswers, setIsShowCorrectAnswers] = useState(false);
  const [isShuffleQuestions, setIsShuffleQuestions] = useState(false);
  const [isShuffleAnswers, setIsShuffleAnswers] = useState(false);

  const [questions, setQuestions] = useState<UIQuestion[]>([]);

  useEffect(() => {
    if (!testId || !courseId) return;

    const fetchAllData = async () => {
      try {
        setIsLoading(true);

        const [testData, course] = await Promise.all([
          testsService.getTestById(testId),
          courseService.getCourseById(courseId),
        ]);

        setTitle(testData.title);
        setNusGroupId(testData.nusGroupId || '');
        setModuleId(testData.courseModuleId || '');
        setAttempts(String(testData.maxAttempts || 1));

        setIsHidden(testData.isHidden ?? false);
        setIsResultHidden(testData.isResultHidden ?? false);
        setIsAttemptHidden(testData.isAttemptHidden ?? false);
        setIsShowCorrectAnswers(testData.isShowCorrectAnswers ?? false);
        setIsShuffleQuestions(testData.isShuffleQuestions ?? false);
        setIsShuffleAnswers(testData.isShuffleAnswers ?? false);

        if (testData.deadline) {
          setDeadline(testData.deadline.substring(0, 16));
        }

        const totalMinutes = testData.timeLimitMinutes || 0;
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        setHours(h > 0 ? String(h) : '');
        setMinutes(m > 0 ? String(m) : '');

        const mappedQuestions: UIQuestion[] = testData.questions.map((q) => ({
          id: q.id,
          type: q.type,
          content: q.content,
          points: q.points,
          answers: q.answers.map((a) => ({
            id: a.id,
            content: a.content,
            isCorrect: a.isCorrect,
          })),
        }));
        setQuestions(mappedQuestions);

        setCourseInfo(course);

        const courseModules = await courseService.getModulesByCourseId(courseId);
        setModules(courseModules || []);

        if (course.subject.id) {
          const groups = await subjectsService.getGradingGroupsBySubject(course.subject.id);
          setNusGroups(groups);
        }
      } catch (error) {
        console.error('Помилка при завантаженні даних тесту:', error);
        toast.error('Не вдалося завантажити дані тесту');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [testId, courseId]);

  const addQuestion = () => {
    const questionId = Math.random().toString(36).substr(2, 9);
    const newQuestion: UIQuestion = {
      id: questionId,
      type: 'ONE_CHOICE',
      content: '',
      points: 1,
      answers: [
        { id: `${questionId}-1`, content: '', isCorrect: true },
        { id: `${questionId}-2`, content: '', isCorrect: false },
      ],
    };
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const updateQuestion = (id: string, updatedFields: Partial<UIQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updatedFields } : q)));
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const onSubmitForm = async () => {
    if (!testId || !courseId) return;

    if (!title.trim()) {
      toast.error('Будь ласка, вкажіть назву тесту');
      return;
    }

    try {
      setIsSubmitting(true);

      const totalTimeLimit = (Number(hours) || 0) * 60 + (Number(minutes) || 0);
      const isNewModule = moduleId && !UUID_REGEXP.test(moduleId);

      const payload: any = {
        courseId,
        title,
        timeLimitMinutes: totalTimeLimit,
        maxAttempts: Number(attempts) || 1,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        nusGroupId: nusGroupId && UUID_REGEXP.test(nusGroupId) ? nusGroupId : null,
        courseModuleId: moduleId && !isNewModule ? moduleId : null,
        newModuleTitle: isNewModule ? moduleId : null,

        isHidden,
        isResultHidden,
        isAttemptHidden,
        isShowCorrectAnswers,
        isShuffleQuestions,
        isShuffleAnswers,

        questions: questions.map((q) => {
          const isRealQuestionUuid = UUID_REGEXP.test(q.id);
          return {
            ...(isRealQuestionUuid && { id: q.id }),
            type: q.type,
            content: q.content,
            points: Number(q.points) || 1,
            answers: q.answers.map((a) => {
              const isRealAnswerUuid = UUID_REGEXP.test(a.id);
              return {
                ...(isRealAnswerUuid && { id: a.id }),
                content: a.content,
                isCorrect: a.isCorrect,
              };
            }),
          };
        }),
      };

      const data = await testsService.updateTest(testId, payload);
      toast.success(data?.message || 'Тест успішно оновлено!');

      setTimeout(() => {
        navigate(`/courses/${courseId}`);
      }, 1500);
    } catch (error: any) {
      console.error('Помилка при оновленні тесту:', error);
      const serverErrorMessage = error?.response?.data?.message || 'Помилка при збереженні змін';
      toast.error(serverErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = useMemo(() => {
    if (!title?.trim()) return false;
    if (!nusGroupId) return false;
    if (!deadline) return false;
    if (!attempts) return false;

    const hasModule = !!moduleId;
    if (!hasModule) return false;

    if (!minutes?.trim() && !hours?.trim()) return false;

    if (!questions || questions.length === 0) return false;

    return questions.every((q) => {
      if (!q.content?.trim()) return false;
      if (!q.answers || q.answers.length < 2) return false;

      const allAnswersFilled = q.answers.every((a) => !!a.content?.trim());
      if (!allAnswersFilled) return false;

      const hasCorrectAnswer = q.answers.some((a) => a.isCorrect);
      if (!hasCorrectAnswer) return false;

      return true;
    });
  }, [title, moduleId, nusGroupId, deadline, minutes, hours, attempts, questions]);

  return {
    isLoading,
    isSubmitting,
    isValid,
    onSubmitForm,
    sidebarProps: {
      modules,
      nusGroups,
      isLoading,
      subjectName: courseInfo?.subject?.name,
      courseClassName: courseInfo?.class?.name,
      title,
      setTitle,
      moduleId,
      setModuleId,
      nusGroupId,
      setNusGroupId,
      deadline,
      setDeadline,
      hours,
      setHours,
      minutes,
      setMinutes,
      attempts,
      setAttempts,
      isHidden,
      setIsHidden,
      isResultHidden,
      setIsResultHidden,
      isAttemptHidden,
      setIsAttemptHidden,
      isShowCorrectAnswers,
      setIsShowCorrectAnswers,
      isShuffleQuestions,
      setIsShuffleQuestions,
      isShuffleAnswers,
      setIsShuffleAnswers,
    },
    questionsProps: {
      questions,
      setQuestions,
      addQuestion,
      updateQuestion,
      deleteQuestion,
    },
  };
};
