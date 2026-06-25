import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/libs/configs/Toast';
import { courseService } from '@/api/courses.service';
import { subjectsService } from '@/api/subjects.service';
import { testsService } from '@/api/tests.service';
import { CourseDetailDto } from '@/types/courses.types';
import { ModuleDto } from '@/types/modules.types';
import { NushGradingGroupDto } from '@/types/subjects.types';
import { UIQuestion, CreateTestPayload } from '@/types/tests.types.ts';

const UUID_REGEXP = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createDefaultQuestion = (): UIQuestion => {
  const questionId = Math.random().toString(36).substr(2, 9);
  return {
    id: questionId,
    type: 'ONE_CHOICE',
    content: '',
    points: 1,
    answers: [
      { id: `${questionId}-1`, content: '', isCorrect: true },
      { id: `${questionId}-2`, content: '', isCorrect: false },
    ],
  };
};

export const useCreateTestForm = (courseId: string | undefined) => {
  const navigate = useNavigate();

  const [courseInfo, setCourseInfo] = useState<CourseDetailDto | null>(null);
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

  const [questions, setQuestions] = useState<UIQuestion[]>(() =>
    Array.from({ length: 4 }, createDefaultQuestion),
  );

  useEffect(() => {
    if (!courseId) return;

    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const course = await courseService.getCourseById(courseId);
        setCourseInfo(course);

        const courseModules = await courseService.getModulesByCourseId(courseId);
        setModules(courseModules || []);

        if (course.subjectId) {
          const groups = await subjectsService.getGradingGroupsBySubject(course.subjectId);
          setNusGroups(groups);
        }
      } catch (error) {
        console.error('Помилка при завантаженні даних для сайдбару:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [courseId]);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createDefaultQuestion()]);
  };

  const updateQuestion = (id: string, updatedFields: Partial<UIQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updatedFields } : q)));
  };

  const onSubmitForm = async () => {
    if (!courseId) {
      toast.error('Курс не знайдено');
      return;
    }

    if (!title.trim()) {
      toast.error('Будь ласка, вкажіть назву тесту');
      return;
    }

    const hasInvalidQuestions = questions.some((q) => q.answers.length < 2);
    if (hasInvalidQuestions) {
      toast.error('Кожне запитання повинно мати щонайменше 2 варіанти відповіді');
      return;
    }

    const isExistingModule = UUID_REGEXP.test(moduleId.trim());
    const finalCourseModuleId = isExistingModule ? moduleId : null;
    const finalNewModuleTitle = !isExistingModule && moduleId.trim() ? moduleId.trim() : null;

    try {
      setIsSubmitting(true);

      const payload: CreateTestPayload = {
        courseId,
        title,
        timeLimitMinutes: (parseInt(hours, 10) || 0) * 60 + (parseInt(minutes, 10) || 0),
        deadline: deadline || null,
        maxAttempts: parseInt(attempts, 10) || 1,
        courseModuleId: finalCourseModuleId,
        newModuleTitle: finalNewModuleTitle,
        nusGroupId: nusGroupId || null,
        isHidden,
        isResultHidden,
        isAttemptHidden,
        isShowCorrectAnswers,
        isShuffleQuestions,
        isShuffleAnswers,
        questions: questions.map((q) => ({
          type: q.type,
          content: q.content,
          points: q.points || 0,
          answers: q.answers.map((a) => ({
            content: a.content,
            isCorrect: a.isCorrect,
          })),
        })),
      };

      const data = await testsService.createTest(payload);
      toast.success((data as any)?.message || 'Тест успішно створено!');

      setTimeout(() => {
        navigate(`/courses/${courseId}`);
      }, 1500);
    } catch (error: any) {
      console.error('Помилка при збереженні тесту:', error);
      const serverErrorMessage = error?.response?.data?.message || 'Помилка при збереженні тесту';
      toast.error(serverErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
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
    },
  };
};
