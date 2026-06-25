import React, { useState, useMemo } from 'react';
import { TwoColumnContentLayout } from '@/components/layout/TwoColumnContentLayout/TwoColumnContentLayout.tsx';
import {
  QuestionNavPanel,
  QuestionNavItem,
} from '@/features/tests/components/QuestionNavPanel/QuestionNavPanel';
import {
  TestPassingQuestionCard,
  AnswerOption,
} from '@/features/tests/components/TestPassingQuestionCard/TestPassingQuestionCard';
import { TestTimer } from '@/components/tests/TestTimer/TestTimer';
import styles from './TestExecutionWorkspace.module.css';

export interface TestQuestion {
  id: string;
  text: string;
  type: 'radio' | 'checkbox';
  points: number;
  options: AnswerOption[];
}

export const TestExecutionWorkspace: React.FC = () => {
  const testTitle = 'Моковий тест: Основи React';
  const initialTimeInSeconds = 1200;

  const questions: TestQuestion[] = [
    {
      id: 'q1',
      text: 'Що таке React?',
      type: 'radio',
      points: 1,
      options: [
        { id: '1-1', label: 'Бібліотека для створення інтерфейсів' },
        { id: '1-2', label: 'Фреймворк для бекенду' },
        { id: '1-3', label: 'База даних' },
      ],
    },
    {
      id: 'q2',
      text: 'Які з цих функцій є хуками React? (оберіть декілька)',
      type: 'checkbox',
      points: 2,
      options: [
        { id: '2-1', label: 'useState' },
        { id: '2-2', label: 'useFunction' },
        { id: '2-3', label: 'useEffect' },
        { id: '2-4', label: 'useMemo' },
      ],
    },
    {
      id: 'q3',
      text: 'Що таке JSX?',
      type: 'radio',
      points: 1,
      options: [
        { id: '3-1', label: 'JavaScript XML' },
        { id: '3-2', label: 'Java Syntax Extension' },
        { id: '3-3', label: 'JSON XML' },
      ],
    },
  ];

  const onBack = () => {
    console.log("Клік по кнопці 'Назад'");
  };

  const onSubmit = (answers: Record<string, string[]>) => {
    console.log('Тест завершено! Зібрані відповіді:', answers);
    alert('Тест завершено! Результати виведено в консоль.');
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const currentQuestion = questions[currentIndex];

  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === questions.length - 1;
  const questionNumber = currentIndex + 1;

  const navItems: QuestionNavItem[] = useMemo(() => {
    return questions.map((q, index) => {
      let status: 'active' | 'answered' | 'unanswered' = 'unanswered';

      if (index === currentIndex) {
        status = 'active';
      } else if (answers[q.id] && answers[q.id].length > 0) {
        status = 'answered';
      }

      return {
        id: q.id,
        number: index + 1,
        status,
      };
    });
  }, [questions, currentIndex, answers]);

  const handleOptionToggle = (optionId: string) => {
    setAnswers((prev) => {
      const currentAnswers = prev[currentQuestion.id] || [];

      if (currentQuestion.type === 'radio') {
        return { ...prev, [currentQuestion.id]: [optionId] };
      } else {
        const isSelected = currentAnswers.includes(optionId);
        if (isSelected) {
          return { ...prev, [currentQuestion.id]: currentAnswers.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [currentQuestion.id]: [...currentAnswers, optionId] };
        }
      }
    });
  };

  const handleQuestionNavClick = (id: string | number) => {
    const index = questions.findIndex((q) => q.id === id);
    if (index !== -1) setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleFinishTest = () => {
    onSubmit(answers);
  };

  const handleTimeUp = () => {
    console.log('Час вичерпано!');
    handleFinishTest();
  };

  if (!currentQuestion) return null;

  return (
    <TwoColumnContentLayout
      title={testTitle}
      onBack={onBack}
      sidebarContent={
        <QuestionNavPanel questions={navItems} onQuestionClick={handleQuestionNavClick} />
      }
      showHeaderButton={false}
      headerRightComponent={
        <div className={styles.headerRightBlock}>
          <TestTimer initialTimeInSeconds={initialTimeInSeconds} onTimeUp={handleTimeUp} />
        </div>
      }
    >
      <div className={styles.workspaceContent}>
        <TestPassingQuestionCard
          questionNumber={questionNumber}
          questionText={currentQuestion.text}
          options={currentQuestion.options}
          selectedOptionIds={answers[currentQuestion.id] || []}
          onOptionToggle={handleOptionToggle}
          type={currentQuestion.type}
          points={currentQuestion.points}
          onPrev={handlePrev}
          onNext={isLastQuestion ? handleFinishTest : handleNext}
          isFirstQuestion={isFirstQuestion}
          isLastQuestion={isLastQuestion}
        />
      </div>
    </TwoColumnContentLayout>
  );
};
