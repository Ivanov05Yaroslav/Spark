import React from 'react';
import {
  ParticipantCard,
  ParticipantData,
} from '@/components/courses/ParticipantCard/ParticipantCard';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard';
import styles from './ParticipantsWorkspace.module.css';

interface ParticipantsWorkspaceProps {
  teachers?: ParticipantData[];
  coTeachers?: ParticipantData[];
  classHomeroomTeacher?: ParticipantData[];
  students?: ParticipantData[];
  onAddParticipant?: () => void;
  onEditParticipant?: (id: string) => void;
  onDeleteParticipant?: (id: string) => void;
}

export const ParticipantsWorkspace: React.FC<ParticipantsWorkspaceProps> = ({
  teachers = [],
  coTeachers = [],
  classHomeroomTeacher = [],
  students = [],
}) => {
  const renderGrid = (users: ParticipantData[], isStudentRow = false) => {
    if (users.length === 0) return null;

    return (
      <div className={isStudentRow ? styles.studentsGrid : styles.topGrid}>
        {users.map((participant) => (
          <ParticipantCard key={participant.id} participant={participant} />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.workspaceContainer}>
      <div className={styles.topRow}>
        {teachers.length > 0 && <ContentCard title="Вчитель">{renderGrid(teachers)}</ContentCard>}

        {coTeachers.length > 0 && (
          <ContentCard title="Співвчителі">{renderGrid(coTeachers)}</ContentCard>
        )}

        {classHomeroomTeacher.length > 0 && (
          <ContentCard title="Класний керівник">{renderGrid(classHomeroomTeacher)}</ContentCard>
        )}
      </div>

      {students.length > 0 && (
        <div className={styles.bottomRow}>
          <ContentCard title="Студенти">{renderGrid(students, true)}</ContentCard>
        </div>
      )}
    </div>
  );
};
