import React, { useRef, useCallback, useState, memo } from 'react';
import { CourseCard } from '@/components/courses/CourseCard/CourseCard.tsx';
import styles from './CoursesList.module.css';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/api/courses.service';
import { toast } from '@/libs/configs/Toast';
import { useStore } from '@/stores/useStore';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal/ConfirmDeleteModal.tsx';

interface CoursesListProps {
  courses: any[];
  isLoading: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  activeRole?: string;
}

const MemoizedCourseItem = memo(({ course, activeRole, userId, onEdit, onDelete }: any) => {
  const classNameStr = course.class?.name ? `${course.class.name} ` : '';
  const subjectNameStr = course.subject?.name || course.title || 'Без назви';
  const title = `${classNameStr}${subjectNameStr}`;

  const startYear = course.startDate ? new Date(course.startDate).getFullYear() : '';
  const endYear = course.endDate ? new Date(course.endDate).getFullYear() : '';
  const year = startYear && endYear ? `${startYear}-${endYear}` : course.year || '2024-2025';

  const teacherName = course.creator
    ? `${course.creator.lastName} ${course.creator.firstName}`
    : course.teacherName || 'Вчитель не призначений';

  const isStudentOrParent = activeRole === 'STUDENT' || activeRole === 'PARENT';
  const isTeacherAndNotCreator = activeRole === 'TEACHER' && course.creatorId !== userId;
  const showMoreButton = !isStudentOrParent && !isTeacherAndNotCreator;

  return (
    <CourseCard
      title={title}
      imageUrl={course.backgroundUrl}
      year={year}
      group={course.groupName}
      studentsCount={course._count?.students || 0}
      teacherName={teacherName}
      teacherAvatar={course.creator?.avatarUrl || course.teacher?.avatarUrl}
      themeColor={course.themeColor || 'purple'}
      onEdit={() => onEdit(course.id)}
      onDelete={() => onDelete(course.id, title)}
      showMoreButton={showMoreButton}
    />
  );
});

export const CoursesList: React.FC<CoursesListProps> = ({
  courses,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  activeRole,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const observer = useRef<IntersectionObserver | null>(null);
  const user = useStore((state) => state.user);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null);

  const deleteCourseMutation = useMutation({
    mutationFn: (id: string) => courseService.deleteCourse(id),
    onSuccess: () => {
      toast.success('Курс успішно видалено');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      closeDeleteModal();
    },
    onError: (error) => {
      console.error('Помилка видалення:', error);
      toast.error('Не вдалося видалити курс');
    },
  });

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && fetchNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 },
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  const handleEdit = useCallback(
    (id: string) => {
      navigate(`/courses/${id}/edit`);
    },
    [navigate],
  );

  const handleDelete = useCallback((id: string, title: string) => {
    setCourseToDelete({ id, title });
    setIsDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCourseToDelete(null);
  };

  const confirmDelete = () => {
    if (courseToDelete?.id) {
      deleteCourseMutation.mutate(courseToDelete.id);
    }
  };

  return (
    <>
      <div className={styles.coursesGrid}>
        {courses.map((course) => (
          <MemoizedCourseItem
            key={course.id}
            course={course}
            activeRole={activeRole}
            userId={user?.id}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}

        <div
          ref={lastElementRef}
          style={{
            minHeight: '30px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: '20px',
            gridColumn: '1 / -1',
          }}
        >
          {isFetchingNextPage && <p style={{ color: '#7E7E7E' }}>Завантаження ще курсів...</p>}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isDeleting={deleteCourseMutation.isPending}
        title="Видалення курсу"
        itemName={courseToDelete?.title ? `курс «${courseToDelete.title}»` : 'цей курс'}
      />
    </>
  );
};
