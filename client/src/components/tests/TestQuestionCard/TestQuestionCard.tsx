import React, { useState, useRef, useEffect } from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard';
import { Input } from '@/components/ui/Input/Input';
import { SelectField } from '@/components/ui/SelectField/SelectField';
import { TestAnswerInput } from '../TestAnswerInput/TestAnswerInput';
import styles from './TestQuestionCard.module.css';

import PlusIcon from '@/assets/plus.svg?react';

export type QuestionType = 'ONE_CHOICE' | 'MULTIPLE_CHOICE';

interface Answer {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface TestQuestionCardProps {
    initialType?: QuestionType;
    index: number;
}

export const TestQuestionCard: React.FC<TestQuestionCardProps> = ({
                                                                      initialType = 'ONE_CHOICE',
                                                                      index
                                                                  }) => {
    const [isActive, setIsActive] = useState<boolean>(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const [questionText, setQuestionText] = useState('');

    const [questionPoints, setQuestionPoints] = useState<number | undefined>();

    const [questionType, setQuestionType] = useState<QuestionType>(initialType);

    const [answers, setAnswers] = useState<Answer[]>([
        { id: '1', text: '', isCorrect: true },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false },
    ]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
                setIsActive(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleCorrect = (answerId: string) => {
        if (questionType === 'ONE_CHOICE') {
            setAnswers(prevAnswers =>
                prevAnswers.map(ans => ({
                    ...ans,
                    isCorrect: ans.id === answerId
                }))
            );
        } else {
            setAnswers(prevAnswers =>
                prevAnswers.map(ans =>
                    ans.id === answerId
                        ? { ...ans, isCorrect: !ans.isCorrect }
                        : ans
                )
            );
        }
    };

    const handleAnswerTextChange = (answerId: string, newText: string) => {
        setAnswers(prevAnswers =>
            prevAnswers.map(ans =>
                ans.id === answerId ? { ...ans, text: newText } : ans
            )
        );
    };

    const handleAddAnswer = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        setAnswers([...answers, { id: newId, text: '', isCorrect: false }]);
    };

    const handleDeleteAnswer = (answerId: string) => {
        if (answers.length <= 2) return;
        setAnswers(prevAnswers => prevAnswers.filter(ans => ans.id !== answerId));
    };

    const typeOptions = [
        { value: 'ONE_CHOICE', label: 'Одинарний вибір' },
        { value: 'MULTIPLE_CHOICE', label: 'Множинний вибір' },
    ];

    const handleTypeChange = (newType: string) => {
        const typedNewType = newType as QuestionType;
        setQuestionType(typedNewType);

        if (typedNewType === 'ONE_CHOICE') {
            setAnswers(prev => {
                let madeOneCorrect = false;
                return prev.map(ans => {
                    if (ans.isCorrect && !madeOneCorrect) {
                        madeOneCorrect = true;
                        return ans;
                    }
                    return { ...ans, isCorrect: false };
                });
            });
        }
    };

    return (
        <div
            ref={cardRef}
            onClick={() => setIsActive(true)}
            className={`${styles.cardWrapper} ${isActive ? styles.activeCard : ''}`}
        >
            <ContentCard title={`Запитання ${index + 1}`} >
                <div className={styles.container}>

                    <div className={styles.topRow}>
                        <Input
                            label={"Текст запитання"}
                            placeholder="Введіть запитання"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            className={styles.questionInput}
                        />

                        <Input
                            type="number"
                            placeholder="Бали"
                            label={"Кількість балів"}
                            value={questionPoints === undefined ? '' : questionPoints.toString()}
                            onChange={(e) => setQuestionPoints(e.target.value ? Number(e.target.value) : undefined)}
                            className={styles.typeSelect}
                        />

                        <SelectField
                            label={"Тип"}
                            options={typeOptions}
                            value={questionType}
                            onChange={handleTypeChange}
                            className={styles.typeSelect}
                        />
                    </div>

                    <div className={styles.answersGrid}>
                        {answers.map((answer, index) => (
                            <TestAnswerInput
                                key={answer.id}
                                placeholder={`Варіант ${index + 1}`}
                                value={answer.text}
                                onChange={(e) => handleAnswerTextChange(answer.id, e.target.value)}
                                isCorrect={answer.isCorrect}
                                onToggleCorrect={() => handleToggleCorrect(answer.id)}
                                onDelete={answers.length > 2 ? () => handleDeleteAnswer(answer.id) : undefined}
                            />
                        ))}
                    </div>

                    {isActive && (
                        <button
                            type="button"
                            className={styles.addOptionBtn}
                            onClick={handleAddAnswer}
                        >
                            <PlusIcon className={styles.plusIcon} />
                            <span>Додати варіант</span>
                        </button>
                    )}

                </div>
            </ContentCard>
        </div>
    );
};