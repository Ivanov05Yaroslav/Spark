import React from 'react';
import { TestQuestionCard } from '@/components/tests/TestQuestionCard/TestQuestionCard.tsx';
import { IconActionButton } from '@/components/ui/IconActionButton/IconActionButton.tsx';
import styles from './TestQuestionsList.module.css';
import PlusIcon from '@/assets/plus.svg?react';
import { UIQuestion } from '@/types/tests.types.ts';

interface TestQuestionsListProps {
  questions: UIQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<UIQuestion[]>>;
  addQuestion: () => void;
  updateQuestion: (id: string, updatedFields: Partial<UIQuestion>) => void;
  deleteQuestion: (id: string) => void;
}

export const TestQuestionsList: React.FC<TestQuestionsListProps> = ({
  questions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.questionsList}>
        {questions.map((question, idx) => (
          <TestQuestionCard
            key={question.id}
            index={idx}
            question={question}
            onUpdate={(updatedFields) => updateQuestion(question.id, updatedFields)}
            onDelete={() => deleteQuestion(question.id)}
          />
        ))}
      </div>

      <div className={styles.addButtonWrapper}>
        <IconActionButton
          icon={<PlusIcon className={styles.icon} />}
          label="Додати запитання"
          onClick={addQuestion}
        />
      </div>
    </div>
  );
};
