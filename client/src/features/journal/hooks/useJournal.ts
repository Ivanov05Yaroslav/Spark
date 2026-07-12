import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journalService } from '@/api/journal.service';
import { toast } from '@/libs/configs/Toast';
import {
  JournalColumn,
  MaterialType,
} from '@/features/journal/components/JournalTable/JournalTable';

export interface JournalGroup {
  id: string;
  name: string;
}

export interface JournalSection {
  id?: string;
  title?: string;
  editable: boolean;
  groups?: JournalGroup[];
}

export interface Student {
  id: string;
  attendance: string | null;
  lessonGrades: Record<string, string>;
  taskGrades: Record<string, string>;
  testGrades: Record<string, string>;
}

export const useJournal = (courseId: string | undefined) => {
  const queryClient = useQueryClient();
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [localChanges, setLocalChanges] = useState<Record<string, string>>({});
  const [modifiedStudents, setModifiedStudents] = useState<Set<string>>(new Set());

  const { data: lessons = [], isLoading: isLoadingLessons } = useQuery({
    queryKey: ['journal-lessons', courseId],
    queryFn: () => journalService.getJournalLessons(courseId!),
    enabled: !!courseId,
  });

  useEffect(() => {
    if (lessons.length > 0 && !selectedLessonId) {
      setSelectedLessonId(lessons[0].id);
    }
  }, [lessons, selectedLessonId]);

  const { data: details, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['journal-lesson-details', courseId, selectedLessonId],
    queryFn: async () => {
      const data = await journalService.getJournalLessonDetails(courseId!, selectedLessonId);
      setLocalChanges({});
      setModifiedStudents(new Set());
      return data;
    },
    enabled: !!courseId && !!selectedLessonId,
  });

  const days = useMemo(() => {
    if (!details) return [];

    const cols: JournalColumn[] = [];
    const addedIds = new Set<string>();

    const addGroups = (section: any, type: MaterialType) => {
      if (!section) return;

      if (section.groups && Array.isArray(section.groups)) {
        section.groups.forEach((g: any) => {
          if (!addedIds.has(g.id)) {
            cols.push({ id: g.id, type, label: g.name, editable: section.editable });
            addedIds.add(g.id);
          }
        });
      } else {
        const colId = section.id || type;
        if (!addedIds.has(colId)) {
          cols.push({
            id: colId,
            type,
            label: section.title || 'Оцінка',
            editable: section.editable,
          });
          addedIds.add(colId);
        }
      }
    };

    if (details.columns.attendance) {
      cols.push({
        id: 'attendance',
        type: 'attendance',
        label: 'Відвідуваність',
        editable: details.columns.attendance.editable,
      });
    }

    addGroups(details.columns.lesson, 'lesson');
    addGroups(details.columns.task, 'task');
    addGroups(details.columns.test, 'test');

    return [
      {
        id: details.lesson.id,
        date: details.lesson.date,
        topic: details.lesson.title,
        columns: cols,
      },
    ];
  }, [details]);

  const handleGradeChange = (
    studentId: string,
    _dayId: string,
    colId: string,
    newGrade: string,
    colType: string,
  ) => {
    let serverValue = newGrade;

    if (colType === 'attendance') {
      if (newGrade === 'Н') serverValue = 'Н';
      else if (newGrade === 'ХВ') serverValue = 'ХВ';
      else serverValue = '';
    }

    setLocalChanges((prev) => ({ ...prev, [`${studentId}|${colType}|${colId}`]: serverValue }));
    setModifiedStudents((prev) => new Set(prev).add(studentId));
  };

  const getGrade = (studentId: string, _dayId: string, colId: string, colType: string) => {
    const key = `${studentId}|${colType}|${colId}`;
    const localVal = localChanges[key];

    const student = details?.students.find((s: Student) => s.id === studentId);
    let serverValRaw = '';

    if (student) {
      if (colType === 'attendance') {
        serverValRaw = student.attendance || '';
      } else {
        const grades = student[`${colType}Grades` as keyof Student] as Record<string, string>;
        serverValRaw = grades?.[colId] || '';
      }
    }

    const currentRaw = localVal !== undefined ? localVal : serverValRaw;

    const formatForUI = (val: string, type: string) => {
      if (type === 'attendance') {
        if (val === 'N' || val === 'Н') return 'Н';
        if (val === 'HV' || val === 'ХВ') return 'ХВ';
        return '';
      }
      return val;
    };

    const displayVal = formatForUI(currentRaw, colType);
    const serverDisplayVal = formatForUI(serverValRaw, colType);

    const isUnsaved = localVal !== undefined && displayVal !== serverDisplayVal;

    return { value: displayVal, isUnsaved };
  };

  const saveMutation = useMutation({
    mutationFn: (payload: object) =>
      journalService.updateJournalLesson(courseId!, selectedLessonId, payload),
    onSuccess: () => {
      toast.success('Журнал оновлено');
      queryClient.invalidateQueries({ queryKey: ['journal-lesson-details'] });
    },
    onError: () => toast.error('Помилка при збереженні змін'),
  });

  const handleSave = () => {
    if (!details) return;

    const changesPayload = Array.from(modifiedStudents).map((studentId) => {
      const studentServerData = details.students.find((s: Student) => s.id === studentId);

      const collectMerged = (type: 'lesson' | 'task' | 'test') => {
        const serverGrades =
          (studentServerData?.[`${type}Grades` as keyof Student] as Record<string, string>) || {};
        const currentColumns =
          days[0]?.columns.filter((c) => c.type === type).map((c) => c.id) || [];

        return currentColumns
          .map((id) => {
            const localVal = localChanges[`${studentId}|${type}|${id}`];
            const finalVal = localVal !== undefined ? localVal : serverGrades[id];
            const numericScore = Number(finalVal);

            return {
              nusGroupId: id,
              score: isNaN(numericScore) || finalVal === '' ? null : numericScore,
            };
          })
          .filter((grade) => grade.score !== null || serverGrades[grade.nusGroupId] !== undefined);
      };

      const localAttendance = localChanges[`${studentId}|attendance|attendance`];
      const finalAttendance =
        localAttendance !== undefined
          ? localAttendance || null
          : (studentServerData?.attendance ?? null);

      return {
        studentId,
        attendance: finalAttendance,
        lessonGrades: collectMerged('lesson'),
        taskGrades: collectMerged('task'),
        testGrades: collectMerged('test'),
      };
    });

    saveMutation.mutate({ changes: changesPayload });
  };

  return {
    lessons,
    selectedLessonId,
    setSelectedLessonId,
    students: details?.students || [],
    days,
    isLoading: isLoadingLessons || (!details && isLoadingDetails),
    isSaving: saveMutation.isPending,
    isDirty: modifiedStudents.size > 0,
    handleGradeChange,
    getGrade,
    handleSave,
  };
};
