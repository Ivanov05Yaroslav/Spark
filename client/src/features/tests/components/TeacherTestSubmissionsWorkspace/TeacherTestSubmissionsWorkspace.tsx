import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  StudentSubmissionsList,
  Submission,
} from '@/features/tasks/components/StudentSubmissionsList/StudentSubmissionsList';
import { CommentsSection } from '@/features/comments/components/CommentsSection/CommentsSection.tsx';
import {
  TestResultsTable,
  TestAttempt,
} from '@/features/tests/components/TestResultsTable/TestResultsTable.tsx';
import { submissionsService } from '@/api/submissions.service';
import { useStore } from '@/stores/useStore';
import { formatToDateTime } from '@/libs/utils/date';
import styles from './TeacherTestSubmissionsWorkspace.module.css';

export const TeacherTestSubmissionsWorkspace: React.FC = () => {
  const { id: courseId, testId } = useParams<{ id: string; testId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useStore((state) => state.user);

  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const selectedStudentId = searchParams.get('studentId') || undefined;

  useEffect(() => {
    if (!testId) return;

    const fetchStudentsAttempts = async () => {
      try {
        setIsLoading(true);
        const data = await submissionsService.getStudentAttempts(testId);
        setStudentsData(data);
      } catch (error) {
        console.error('Помилка завантаження спроб учнів:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentsAttempts();
  }, [testId]);

  useEffect(() => {
    if (studentsData.length > 0 && !searchParams.get('studentId')) {
      setSearchParams(
        (prev) => {
          prev.set('studentId', studentsData[0].id);
          return prev;
        },
        { replace: true },
      );
    }
  }, [studentsData, searchParams, setSearchParams]);

  const mappedSubmissions = useMemo<Submission[]>(() => {
    return studentsData.map((student) => {
      let status: 'Graded' | 'Assigned' | 'Missing' = 'Assigned';

      if (student.attemptsCount > 0) {
        status = 'Graded';
      }

      return {
        id: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        avatarUrl: student.avatarUrl,
        status: status,
        grade: student.highestScore,
      };
    });
  }, [studentsData]);

  const selectedStudent = studentsData.find((s) => s.id === selectedStudentId);

  const formattedAttempts = useMemo<TestAttempt[]>(() => {
    if (!selectedStudent || !selectedStudent.attempts) return [];

    return selectedStudent.attempts.map((attempt: any) => {
      const minutes = Math.floor(attempt.duration / 60);
      const seconds = attempt.duration % 60;
      const durationStr = `${minutes}хв ${seconds}с`;

      return {
        id: attempt.id,
        number: attempt.attemptNumber,
        duration: durationStr,
        correctAnswers: null,
        wrongAnswers: null,
        completionDate: formatToDateTime(attempt.submittedAt),
        mark: attempt.score !== null ? attempt.score : null,
        hasDetails: true,
      };
    });
  }, [selectedStudent]);

  const handleStudentSelect = (id: string) => {
    setSearchParams((prev) => {
      prev.set('studentId', id);
      return prev;
    });
  };

  const handleViewOverview = (attemptId: string) => {
    navigate(`/courses/${courseId}/tests/${testId}/review/${attemptId}`);
  };

  if (isLoading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Завантаження списку учнів...</div>;
  }

  return (
    <div className={styles.contentGrid}>
      <div className={styles.leftColumn}>
        <StudentSubmissionsList
          submissions={mappedSubmissions}
          selectedId={selectedStudentId}
          onItemClick={handleStudentSelect}
        />
      </div>

      <div className={styles.rightColumn}>
        <TestResultsTable attempts={formattedAttempts} onViewDetails={handleViewOverview} />

        {selectedStudentId && (
          <CommentsSection
            testId={testId}
            targetStudentId={selectedStudentId}
            currentUserAvatar={user?.avatarUrl}
          />
        )}
      </div>
    </div>
  );
};
