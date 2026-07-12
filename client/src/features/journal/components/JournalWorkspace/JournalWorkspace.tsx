import React from 'react';
import { useParams } from 'react-router-dom';
import { JournalTable } from '@/features/journal/components/JournalTable/JournalTable';
import { useJournal } from '@/features/journal/hooks/useJournal';
import { SelectField } from '@/components/ui/SelectField/SelectField';
import { SecondaryButton } from '@/components/ui/SecondaryButton/SecondaryButton';
import styles from './JournalWorkspace.module.css';

export const JournalWorkspace: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();

  const {
    lessons,
    selectedLessonId,
    setSelectedLessonId,
    students,
    days,
    isLoading,
    isSaving,
    isDirty,
    handleGradeChange,
    getGrade,
    handleSave,
  } = useJournal(courseId);

  const lessonOptions = lessons.map((l: any) => ({
    value: l.id,
    label: l.title,
  }));

  if (isLoading) {
    return <div style={{ padding: 24 }}>Завантаження журналу...</div>;
  }

  return (
    <div className={styles.workspace}>
      <div className={styles.controlsSection}>
        <SelectField
          className={styles.subjectSelect}
          value={selectedLessonId}
          onChange={setSelectedLessonId}
          options={lessonOptions}
          placeholder="Оберіть урок"
        />

        <SecondaryButton
          variantColor={isDirty ? 'default' : 'gray'}
          onClick={handleSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? 'Збереження...' : 'Зберегти'}
        </SecondaryButton>
      </div>

      <main className={styles.content}>
        {days.length > 0 && students.length > 0 ? (
          <JournalTable
            students={students}
            days={days}
            onGradeChange={handleGradeChange}
            getGrade={getGrade}
            key={selectedLessonId}
          />
        ) : (
          <div style={{ textAlign: 'center', marginTop: 40, color: '#6b7280' }}>
            Дані для журналу відсутні.
          </div>
        )}
      </main>
    </div>
  );
};
