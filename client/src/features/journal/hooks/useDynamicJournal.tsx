import { useMemo } from 'react';

export type JournalMode = 'NUSH' | 'STANDARD';

export interface JournalColumn {
  id: string;
  type: 'attendance' | 'lesson' | 'homework' | 'test';
  label: string;
  groupNumber?: number;
}

interface JournalConfig {
  classLevel: number;
  activeLessonGroups: number[];
  activeHomeworkGroups: number[];
  activeTestGroups: number[];
}

export const useDynamicJournal = ({
  classLevel,
  activeLessonGroups,
  activeHomeworkGroups,
  activeTestGroups,
}: JournalConfig) => {
  const journalMode = useMemo<JournalMode>(() => {
    return classLevel >= 5 && classLevel <= 9 ? 'NUSH' : 'STANDARD';
  }, [classLevel]);

  const columns = useMemo<JournalColumn[]>(() => {
    const cols: JournalColumn[] = [
      { id: 'attendance', type: 'attendance', label: 'Відвідуваність' },
    ];

    if (journalMode === 'NUSH') {
      activeLessonGroups.forEach((gr) => {
        cols.push({
          id: `lesson-gr-${gr}`,
          type: 'lesson',
          groupNumber: gr,
          label: `Урок ГР${gr}`,
        });
      });

      activeHomeworkGroups.forEach((gr) => {
        cols.push({
          id: `homework-gr-${gr}`,
          type: 'homework',
          groupNumber: gr,
          label: `ДЗ ГР${gr}`,
        });
      });

      activeTestGroups.forEach((gr) => {
        cols.push({ id: `test-gr-${gr}`, type: 'test', groupNumber: gr, label: `Тест ГР${gr}` });
      });
    } else {
      cols.push({ id: 'lesson-std', type: 'lesson', label: 'Урок' });

      cols.push({ id: 'homework-std', type: 'homework', label: 'ДЗ' });

      cols.push({ id: 'test-std', type: 'test', label: 'Тест' });
    }

    return cols;
  }, [journalMode, activeLessonGroups, activeHomeworkGroups, activeTestGroups]);

  return {
    journalMode,

    columns,
  };
};
