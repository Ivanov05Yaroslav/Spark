import React, { useState } from 'react';
import { TestQuestionCard } from '@/components/tests/TestQuestionCard/TestQuestionCard.tsx';
import { IconActionButton } from '@/components/ui/IconActionButton/IconActionButton.tsx';
import styles from './TestQuestionsList.module.css';

import PlusIcon from '@/assets/plus.svg?react';

interface Question {
    id: string;
}

export const TestQuestionsList: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([
        { id: '1' }
    ]);

    const handleAddQuestion = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        setQuestions([...questions, { id: newId }]);
    };

    return (
        <div className={styles.container}>
            <div className={styles.questionsList}>
                {questions.map((question, idx) => (
                    <TestQuestionCard key={question.id} index={idx} />
                ))}
            </div>

            <div className={styles.addButtonWrapper}>
                <IconActionButton
                    icon={<PlusIcon className={styles.icon} />}
                    label="Додати запитання"
                    onClick={handleAddQuestion}
                />
            </div>
        </div>
    );
};