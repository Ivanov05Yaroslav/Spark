import React from 'react';
import { GradeCell } from '@/components/journal/GradeCell/GradeCell';
import { useDynamicJournal } from '@/features/journal/hooks/useDynamicJournal';
import styles from './JournalTable.module.css';
import { Avatar } from '@/components/ui/Avatar/Avatar.tsx';

export type MaterialType = 'attendance' | 'lesson' | 'task' | 'test';

export interface JournalColumn {
  id: string;
  type: MaterialType;
  label: string;
  editable?: boolean;
}

export interface Student {
  id: string;
  firstName: string;
  middleName?: string;
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
  onGradeChange: (
    studentId: string,
    dayId: string,
    columnId: string,
    newGrade: string,
    colType: string,
  ) => void;
  getGrade: (
    studentId: string,
    dayId: string,
    columnId: string,
    colType: string,
  ) => { value: string; isUnsaved: boolean };
}

const TYPE_LABELS: Record<string, string> = {
  attendance: 'Відвідуваність',
  lesson: 'Урок',
  task: 'Завдання',
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
  const handleTableKeyDown = (e: React.KeyboardEvent, rIndex: number, cIndex: number) => {
    let nextRow = rIndex;
    let nextCol = cIndex;

    switch (e.key) {
      case 'ArrowUp':
        nextRow = rIndex - 1;
        break;
      case 'ArrowDown':
        nextRow = rIndex + 1;
        break;
      case 'ArrowLeft':
        nextCol = cIndex - 1;
        break;
      case 'ArrowRight':
        nextCol = cIndex + 1;
        break;
      default:
        return;
    }

    const nextCell = document.getElementById(`cell-${nextRow}-${nextCol}`);
    if (nextCell) {
      e.preventDefault();
      nextCell.focus();
    }
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th rowSpan={3} className={styles.subCol}>
              Учень
            </th>
            {days.map((day) => (
              <th key={day.id} colSpan={day.columns.length} className={styles.subCol}>
                {day.topic || day.date}
              </th>
            ))}
          </tr>
          <tr>
            {days.map((day) => {
              const groups = getColumnGroups(day.columns);
              return groups.map((g, i) => {
                const isAttendance = g.type === 'attendance';
                return (
                  <th
                    key={`${day.id}-group-${i}`}
                    colSpan={g.count}
                    rowSpan={isAttendance ? 2 : 1}
                    className={styles.subCol}
                    style={isAttendance ? { verticalAlign: 'middle' } : undefined}
                  >
                    {TYPE_LABELS[g.type] || g.type}
                  </th>
                );
              });
            })}
          </tr>
          <tr>
            {days.map((day) =>
              day.columns.map((col) => {
                if (col.type === 'attendance') return null;
                return (
                  <th key={`${day.id}-${col.id}`} className={styles.subCol}>
                    <div className={styles.verticalText}>{col.label}</div>
                  </th>
                );
              }),
            )}
          </tr>
        </thead>
        <tbody>
          {students.map((student, rIndex) => {
            let cIndex = 0;

            const isAbsentRow = days.some((day) => {
              const attendanceCol = day.columns.find((c) => c.type === 'attendance');
              if (!attendanceCol) return false;

              const grade = getGrade(student.id, day.id, attendanceCol.id, 'attendance').value;
              return grade === 'Н' || grade === 'ХВ';
            });

            return (
              <tr key={student.id}>
                <td
                  className={`${styles.studentNameCol} ${isAbsentRow ? styles.absentDayCell : ''}`}
                >
                  <div className={styles.studentInfo}>
                    <Avatar src={student.avatarUrl} size={32} />
                    <span className={styles.studentName}>
                      {student.lastName} {student.firstName} {student.middleName}
                    </span>
                  </div>
                </td>
                {days.map((day) => {
                  const attendanceCol = day.columns.find((c) => c.type === 'attendance');

                  const isAbsentDay = attendanceCol
                    ? ['Н', 'ХВ'].includes(
                        getGrade(student.id, day.id, attendanceCol.id, 'attendance').value,
                      )
                    : false;

                  return day.columns.map((col, colIndex) => {
                    const gradeData = getGrade(student.id, day.id, col.id, col.type);
                    const currentGrade = gradeData.value;
                    const isUnsaved = gradeData.isUnsaved;
                    const isAttendance = col.type === 'attendance';

                    const isDisabled = (isAbsentDay && !isAttendance) || col.editable === false;

                    const currentCIndex = cIndex++;

                    return (
                      <td
                        key={`${student.id}-${day.id}-${col.id}-${colIndex}`}
                        className={`${styles.gradeTd} ${isAbsentDay ? styles.absentDayCell : ''}`}
                        onKeyDown={(e) => handleTableKeyDown(e, rIndex, currentCIndex)}
                      >
                        <GradeCell
                          id={`cell-${rIndex}-${currentCIndex}`}
                          initialGrade={currentGrade}
                          isAttendance={isAttendance}
                          disabled={isDisabled}
                          isUnsaved={isUnsaved}
                          onSave={(newGrade) =>
                            onGradeChange(student.id, day.id, col.id, newGrade, col.type)
                          }
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
