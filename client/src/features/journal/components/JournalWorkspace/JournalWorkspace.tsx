import React, { useState, useMemo } from 'react';
import {
  JournalTable,
  Student,
  JournalDay,
} from '@/features/journal/components/JournalTable/JournalTable';
import { useDynamicJournal } from '@/features/journal/hooks/useDynamicJournal';
import { SelectField } from '@/components/ui/SelectField/SelectField';
import { SecondaryButton } from '@/components/ui/SecondaryButton/SecondaryButton';
import styles from './JournalWorkspace.module.css';

const MOCK_STUDENTS: Student[] = [
  {
    id: 's1',
    firstName: 'Іван',
    lastName: 'Шевченко',
    avatarUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSK7xeIFSlfFUM62huUGP53PaCs7JFPNL8sq29uu572yH6GtnwErFmbXLNv&s=10',
  },
  {
    id: 's2',
    firstName: 'Марія',
    lastName: 'Коваленко',
    avatarUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSK7xeIFSlfFUM62huUGP53PaCs7JFPNL8sq29uu572yH6GtnwErFmbXLNv&s=10',
  },
  {
    id: 's3',
    firstName: 'Олександр',
    lastName: 'Бойко',
    avatarUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSK7xeIFSlfFUM62huUGP53PaCs7JFPNL8sq29uu572yH6GtnwErFmbXLNv&s=10',
  },
];

const LESSONS_OPTIONS = [
  { value: 'lesson1', label: '12.11 Тема уроку' },
  { value: 'lesson2', label: '13.11 Тема уроку' },
  { value: 'lesson3', label: '14.11 Тема уроку' },
];

export const JournalWorkspace: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const { columns } = useDynamicJournal({
    classLevel: 5,
    activeLessonGroups: [1, 2],
    activeHomeworkGroups: [1],
    activeTestGroups: [],
  });

  const days = useMemo<JournalDay[]>(
    () => [{ id: 'day1', date: '1 Вересня', topic: 'Вступ', columns }],
    [columns],
  );

  const handleGradeChange = (
    studentId: string,
    dayId: string,
    columnId: string,
    newGrade: string,
  ) => {
    const key = `${studentId}-${dayId}-${columnId}`;
    setGrades((prev) => ({
      ...prev,
      [key]: newGrade,
    }));
    setIsDirty(true);
  };

  const getGrade = (studentId: string, dayId: string, columnId: string) => {
    const key = `${studentId}-${dayId}-${columnId}`;
    return grades[key] || '';
  };

  const handleSave = () => {
    console.log('Зберігаємо дані на сервер...', grades);

    setTimeout(() => {
      setIsDirty(false);
    }, 500);
  };

  return (
    <div className={styles.workspace}>
      <div className={styles.controlsSection}>
        <SelectField
          className={styles.subjectSelect}
          value={selectedSubject}
          onChange={setSelectedSubject}
          options={LESSONS_OPTIONS}
        />

        <SecondaryButton
          variantColor={isDirty ? 'default' : 'gray'}
          onClick={handleSave}
          disabled={!isDirty}
        >
          Зберегти
        </SecondaryButton>
      </div>

      <main className={styles.content}>
        <JournalTable
          students={MOCK_STUDENTS}
          days={days}
          onGradeChange={handleGradeChange}
          getGrade={getGrade}
        />
      </main>
    </div>
  );
};
