import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TwoColumnContentLayout } from '@/components/layout/TwoColumnContentLayout/TwoColumnContentLayout.tsx';
import { QuestionNavPanel } from '@/features/tests/components/QuestionNavPanel/QuestionNavPanel';
import { TestPassingQuestionCard } from '@/features/tests/components/TestPassingQuestionCard/TestPassingQuestionCard';
import { TestTimer } from '@/components/tests/TestTimer/TestTimer';
import styles from './TestExecutionWorkspace.module.css';
import { useTestExecution } from '@/features/tests/hooks/useTestExecution';

export const TestExecutionWorkspace: React.FC = () => {
  const { id: courseId, testId } = useParams<{ id: string; testId: string }>();
  const navigate = useNavigate();

  const {
    test,
    isLoading,
    currentIndex,
    answers,
    mappedCurrentQuestion,
    navItems,
    isSubmitting,
    handleOptionToggle,
    handleNext,
    handlePrev,
    handleQuestionNavClick,
    handleFinishTest,
    handleTimeUp,
    isFirstQuestion,
    isLastQuestion,
    initialTimeInSeconds,
  } = useTestExecution(testId);

  const handleBack = () => {
    navigate(`/courses/${courseId}`);
  };

  if (isLoading) {
    return <div style={{ padding: '24px' }}>Завантаження тесту...</div>;
  }

  if (!test || !mappedCurrentQuestion) {
    return <div style={{ padding: '24px' }}>Тест не знайдено або він не містить запитань.</div>;
  }

  return (
    <TwoColumnContentLayout
      title={test.title}
      onBack={handleBack}
      sidebarContent={
        <QuestionNavPanel questions={navItems} onQuestionClick={handleQuestionNavClick} />
      }
      showHeaderButton={false}
      headerRightComponent={
        <div className={styles.headerRightBlock}>
          {initialTimeInSeconds > 0 && (
            <TestTimer initialTimeInSeconds={initialTimeInSeconds} onTimeUp={handleTimeUp} />
          )}
        </div>
      }
    >
      <div className={styles.workspaceContent}>
        <TestPassingQuestionCard
          questionNumber={currentIndex + 1}
          questionText={mappedCurrentQuestion.text}
          options={mappedCurrentQuestion.options}
          selectedOptionIds={answers[mappedCurrentQuestion.id] || []}
          onOptionToggle={(optionId) =>
            handleOptionToggle(
              mappedCurrentQuestion.id,
              optionId,
              mappedCurrentQuestion.type === 'checkbox',
            )
          }
          type={mappedCurrentQuestion.type}
          points={mappedCurrentQuestion.points}
          onPrev={handlePrev}
          onNext={isLastQuestion ? handleFinishTest : handleNext}
          isFirstQuestion={isFirstQuestion}
          isLastQuestion={isLastQuestion}
          isSubmitting={isSubmitting}
        />
      </div>
    </TwoColumnContentLayout>
  );
};
