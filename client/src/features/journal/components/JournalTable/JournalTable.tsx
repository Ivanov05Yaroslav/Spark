import React from 'react';
import { GradeCell } from '@/components/journal/GradeCell/GradeCell';
import { JournalColumn } from '@/features/journal/hooks/useDynamicJournal';
import styles from './JournalTable.module.css';
import { Avatar } from '@/components/ui/Avatar/Avatar.tsx';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface JournalDay {
  id: string;
  date: string;
  topic?: string;
  columns: JournalColumn[];
}

interface JournalTableProps {
  students: Student[];
  days: JournalDay[];
  onGradeChange: (studentId: string, dayId: string, columnId: string, newGrade: string) => void;
  getGrade: (studentId: string, dayId: string, columnId: string) => string;
}

const TYPE_LABELS: Record<string, string> = {
  attendance: 'Відвідуваність',
  lesson: 'Урок',
  homework: 'Домашнє завдання',
  test: 'Тест',
};

const getColumnGroups = (columns: JournalColumn[]) => {
  const groups: { type: string; count: number }[] = [];
  columns.forEach((col) => {
    const last = groups[groups.length - 1];
    if (last && last.type === col.type) {
      last.count += 1;
    } else {
      groups.push({ type: col.type, count: 1 });
    }
  });
  return groups;
};

export const JournalTable: React.FC<JournalTableProps> = ({
  students,
  days,
  onGradeChange,
  getGrade,
}) => {
  const handleTableKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

    if (e.target instanceof HTMLInputElement) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') return;
    }

    let nextR = r;
    let nextC = c;

    if (e.key === 'ArrowUp') nextR -= 1;
    if (e.key === 'ArrowDown') nextR += 1;
    if (e.key === 'ArrowLeft') nextC -= 1;
    if (e.key === 'ArrowRight') nextC += 1;

    const nextCell = document.getElementById(`cell-${nextR}-${nextC}`);
    if (nextCell) {
      e.preventDefault();
      nextCell.focus();
    }
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.journalTable}>
        <thead>
          <tr>
            <th rowSpan={3} className={`${styles.stickyCol} ${styles.topLeftCell}`}>
              <div className={styles.headerTitle}>Учні</div>
            </th>
            {days.map((day) => (
              <th key={day.id} colSpan={day.columns.length} className={styles.dayHeader}>
                <div className={styles.headerTitle}>
                  {day.date} {day.topic}
                </div>
              </th>
            ))}
          </tr>

          <tr>
            {days.map((day) =>
              getColumnGroups(day.columns).map((group, index) => (
                <th
                  key={`${day.id}-group-${index}`}
                  colSpan={group.count}
                  rowSpan={group.type === 'attendance' ? 2 : 1}
                  className={`${styles.subColumnHeader} ${styles.groupHeader}`}
                >
                  {TYPE_LABELS[group.type] || group.type}
                </th>
              )),
            )}
          </tr>

          <tr>
            {days.map((day) =>
              day.columns.map((col) => {
                if (col.type === 'attendance') return null;

                return (
                  <th key={`${day.id}-${col.id}-sub`} className={styles.subColumnHeader}>
                    {col.groupNumber ? `ГР${col.groupNumber}` : ''}
                  </th>
                );
              }),
            )}
          </tr>
        </thead>

        <tbody>
          {students.map((student, rIndex) => {
            const isAbsentAnywhere = days.some((day) => {
              const attendanceCol = day.columns.find((c) => c.type === 'attendance');
              return attendanceCol ? getGrade(student.id, day.id, attendanceCol.id) === 'Н' : false;
            });

            let cIndex = 0;

            return (
              <tr key={student.id} className={styles.studentRow}>
                <td
                  className={`${styles.stickyCol} ${isAbsentAnywhere ? styles.absentDayCell : ''}`}
                >
                  <div className={styles.studentInfo}>
                    <Avatar src={student.avatarUrl} size={32} />
                    <span className={styles.studentName}>
                      {student.lastName} {student.firstName}
                    </span>
                  </div>
                </td>

                {days.map((day) => {
                  const attendanceCol = day.columns.find((c) => c.type === 'attendance');
                  const isAbsentDay = attendanceCol
                    ? getGrade(student.id, day.id, attendanceCol.id) === 'Н'
                    : false;

                  return day.columns.map((col) => {
                    const currentGrade = getGrade(student.id, day.id, col.id);
                    const isAttendance = col.type === 'attendance';
                    const isReadOnlyType = col.type === 'homework' || col.type === 'test';

                    const isDisabled = (isAbsentDay && !isAttendance) || isReadOnlyType;

                    const currentCIndex = cIndex++;

                    return (
                      <td
                        key={`${student.id}-${day.id}-${col.id}`}
                        className={`${styles.gradeTd} ${isAbsentDay ? styles.absentDayCell : ''}`}
                        onKeyDown={(e) => handleTableKeyDown(e, rIndex, currentCIndex)}
                      >
                        <GradeCell
                          id={`cell-${rIndex}-${currentCIndex}`}
                          initialGrade={currentGrade}
                          isAttendance={isAttendance}
                          disabled={isDisabled}
                          onSave={(newGrade) => onGradeChange(student.id, day.id, col.id, newGrade)}
                        />
                      </td>
                    );
                  });
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
