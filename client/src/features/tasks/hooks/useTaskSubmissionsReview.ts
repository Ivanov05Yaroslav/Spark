import { useState, useEffect, useCallback, useMemo } from 'react';
import { submissionsService } from '@/api/submissions.service';
import { toast } from '@/libs/configs/Toast';
import { Submission } from '@/features/tasks/components/StudentSubmissionsList/StudentSubmissionsList';

export const useTaskSubmissionsReview = (taskId: string | undefined) => {
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);

  const [submissionDetail, setSubmissionDetail] = useState<any | null>(null);

  const [gradeValue, setGradeValue] = useState<string | number>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchStudentsList = useCallback(async () => {
    if (!taskId) return;
    try {
      setIsLoading(true);
      const data = await submissionsService.getStudentSubmissionsList(taskId);
      setStudentsData(data);

      if (data.length > 0 && !selectedStudentId) {
        setSelectedStudentId(data[0].id);
      }
    } catch (error: any) {
      console.error('Помилка завантаження списку:', error);
      toast.error(error?.response?.data?.message || 'Не вдалося завантажити список учнів');
    } finally {
      setIsLoading(false);
    }
  }, [taskId, selectedStudentId]);

  useEffect(() => {
    fetchStudentsList();
  }, [fetchStudentsList]);

  const fetchSubmissionDetail = useCallback(async () => {
    if (!taskId || !selectedStudentId) return;
    try {
      setIsDetailLoading(true);
      const data = await submissionsService.getStudentSubmissionDetail(taskId, selectedStudentId);
      setSubmissionDetail(data);
      setGradeValue(data?.score !== null ? data.score : '');
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setSubmissionDetail(null);
        setGradeValue('');
      } else {
        console.error('Помилка завантаження роботи:', error);
      }
    } finally {
      setIsDetailLoading(false);
    }
  }, [taskId, selectedStudentId]);

  useEffect(() => {
    fetchSubmissionDetail();
  }, [fetchSubmissionDetail]);

  const handleGradeSubmit = async () => {
    const subId = submissionDetail?.id;
    if (!subId) {
      toast.error('Учень ще не здав роботу, оцінити неможливо');
      return;
    }

    try {
      await submissionsService.gradeSubmission(subId, gradeValue);
      toast.success('Оцінку успішно збережено');
      await fetchStudentsList();
    } catch (error: any) {
      console.error('Помилка оцінювання:', error);
      toast.error(error?.response?.data?.message || 'Не вдалося виставити оцінку');
    }
  };

  const mappedSubmissions: Submission[] = useMemo(() => {
    return studentsData.map((student) => {
      let status: 'Assigned' | 'Turned in' | 'Graded' | 'Missing' = 'Assigned';
      if (student.score !== null) status = 'Graded';
      else if (student.status === 'SUBMITTED') status = 'Turned in';

      return {
        id: student.id,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        avatarUrl: student.avatarUrl,
        status,
        grade: student.score,
      };
    });
  }, [studentsData]);

  const currentStudent = mappedSubmissions.find((s) => s.id === selectedStudentId);
  const statusText =
    currentStudent?.status === 'Turned in'
      ? 'Здано'
      : currentStudent?.status === 'Graded'
        ? 'Оцінено'
        : 'Призначено';

  return {
    mappedSubmissions,
    selectedStudentId,
    setSelectedStudentId,
    submissionDetail,
    statusText,
    gradeValue,
    setGradeValue,
    handleGradeSubmit,
    isLoading,
    isDetailLoading,
  };
};
