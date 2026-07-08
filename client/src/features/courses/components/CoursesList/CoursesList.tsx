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

const MemoizedCourseItem = memo(
  ({
    course,
    activeRole,
    userId,
    onEdit,
    onDelete,
    onArchive,
    onUnArchive,
    onHide,
    onShow,
  }: any) => {
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

    const isCourseArchived = !!course.isArchive;
    const isCourseHidden = !!course.isHidden;

    return (
      <CourseCard
        id={course.id}
        title={title}
        imageUrl={course.backgroundUrl}
        year={year}
        group={course.groupName}
        teacherName={teacherName}
        teacherAvatar={course.creator?.avatarUrl || course.teacher?.avatarUrl}
        themeColor={course.themeColor || 'purple'}
        onEdit={() => onEdit(course.id)}
        onDelete={() => onDelete(course.id, title)}
        onArchive={isCourseArchived ? undefined : () => onArchive(course.id, title)}
        onUnArchive={isCourseArchived ? () => onUnArchive(course.id, title) : undefined}
        onHide={isCourseHidden ? undefined : () => onHide(course.id, title)}
        onShow={isCourseHidden ? () => onShow(course.id, title) : undefined}
        showMoreButton={showMoreButton}
      />
    );
  },
);

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

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [courseToArchive, setCourseToArchive] = useState<{
    id: string;
    title: string;
    isUnarchive: boolean;
  } | null>(null);

  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [courseToHide, setCourseToHide] = useState<{
    id: string;
    title: string;
    shouldHide: boolean;
  } | null>(null);

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

  const archiveCourseMutation = useMutation({
    mutationFn: async ({ id, isUnarchive }: { id: string; isUnarchive: boolean }) => {
      const detail = await courseService.getCourseById(id);
      const formData = new FormData();
      formData.append('subjectId', String(detail.subject?.id || ''));
      formData.append('classId', String(detail.class?.id || ''));
      if (detail.startDate) formData.append('startDate', detail.startDate);
      if (detail.endDate) formData.append('endDate', detail.endDate);
      formData.append('themeColor', detail.themeColor || 'purple');

      if (isUnarchive) {
        formData.append('isArchive', 'false');
      } else {
        formData.append('isArchive', 'true');
      }

      if (detail.participants?.coTeachers && detail.participants.coTeachers.length > 0) {
        formData.append(
          'coTeacherIds',
          detail.participants.coTeachers.map((t: any) => t.id).join(','),
        );
      }
      if (detail.groupName) {
        formData.append('groupName', detail.groupName);
        if (detail.participants?.students && detail.participants.students.length > 0) {
          formData.append(
            'studentIds',
            detail.participants.students.map((s: any) => s.id).join(','),
          );
        }
      }
      return courseService.updateCourse(id, formData);
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.isUnarchive ? 'Курс успішно розархівовано' : 'Курс успішно архівовано',
      );
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      closeArchiveModal();
    },
    onError: (error, variables) => {
      console.error('Помилка зміни статусу архіву:', error);
      toast.error(
        variables.isUnarchive ? 'Не вдалося розархівувати курс' : 'Не вдалося архівувати курс',
      );
    },
  });

  const toggleHideCourseMutation = useMutation({
    mutationFn: async ({ id, shouldHide }: { id: string; shouldHide: boolean }) => {
      const detail = await courseService.getCourseById(id);
      const formData = new FormData();
      formData.append('subjectId', String(detail.subject?.id || ''));
      formData.append('classId', String(detail.class?.id || ''));
      if (detail.startDate) formData.append('startDate', detail.startDate);
      if (detail.endDate) formData.append('endDate', detail.endDate);
      formData.append('themeColor', detail.themeColor || 'purple');

      formData.append('isHidden', String(shouldHide));
      formData.append('isArchived', String(detail.isArchived));

      if (detail.participants?.coTeachers && detail.participants.coTeachers.length > 0) {
        formData.append(
          'coTeacherIds',
          detail.participants.coTeachers.map((t: any) => t.id).join(','),
        );
      }
      if (detail.groupName) {
        formData.append('groupName', detail.groupName);
        if (detail.participants?.students && detail.participants.students.length > 0) {
          formData.append(
            'studentIds',
            detail.participants.students.map((s: any) => s.id).join(','),
          );
        }
      }
      return courseService.updateCourse(id, formData);
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.shouldHide
          ? 'Курс успішно зроблено запланованим'
          : 'Курс успішно зроблено незапланованим',
      );
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      closeHideModal();
    },
    onError: (error) => {
      console.error('Помилка зміни статусу прихованості:', error);
      toast.error('Не вдалося змінити статус планування курсу');
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

  const handleArchive = useCallback((id: string, title: string) => {
    setCourseToArchive({ id, title, isUnarchive: false });
    setIsArchiveModalOpen(true);
  }, []);

  const handleUnArchive = useCallback((id: string, title: string) => {
    setCourseToArchive({ id, title, isUnarchive: true });
    setIsArchiveModalOpen(true);
  }, []);

  const closeArchiveModal = () => {
    setIsArchiveModalOpen(false);
    setCourseToArchive(null);
  };

  const confirmArchive = () => {
    if (courseToArchive?.id) {
      archiveCourseMutation.mutate({
        id: courseToArchive.id,
        isUnarchive: courseToArchive.isUnarchive,
      });
    }
  };

  const handleHide = useCallback((id: string, title: string) => {
    setCourseToHide({ id, title, shouldHide: true });
    setIsHideModalOpen(true);
  }, []);

  const handleShow = useCallback((id: string, title: string) => {
    setCourseToHide({ id, title, shouldHide: false });
    setIsHideModalOpen(true);
  }, []);

  const closeHideModal = () => {
    setIsHideModalOpen(false);
    setCourseToHide(null);
  };

  const confirmToggleHide = () => {
    if (courseToHide?.id) {
      toggleHideCourseMutation.mutate({ id: courseToHide.id, shouldHide: courseToHide.shouldHide });
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
            onArchive={handleArchive}
            onUnArchive={handleUnArchive}
            onHide={handleHide}
            onShow={handleShow}
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

      <ConfirmDeleteModal
        isOpen={isArchiveModalOpen}
        onClose={closeArchiveModal}
        onConfirm={confirmArchive}
        isDeleting={archiveCourseMutation.isPending}
        title={
          courseToArchive?.isUnarchive
            ? 'Підтвердження розархівування'
            : 'Підтвердження архівування курсу'
        }
        loadingText={courseToArchive?.isUnarchive ? 'Розархівування...' : 'Архівування...'}
        confirmText={courseToArchive?.isUnarchive ? 'Розархівувати' : 'Архівувати'}
        itemName={courseToArchive?.title ? `курс «${courseToArchive.title}»` : 'цей курс'}
        variantColor={courseToArchive?.isUnarchive ? 'gray' : 'yellow'}
        actionName={courseToArchive?.isUnarchive ? 'розархівувати' : 'архівувати'}
      />

      <ConfirmDeleteModal
        isOpen={isHideModalOpen}
        onClose={closeHideModal}
        onConfirm={confirmToggleHide}
        isDeleting={toggleHideCourseMutation.isPending}
        title={
          courseToHide?.shouldHide ? 'Зробити курс запланованим' : 'Зробити курс незапланованим'
        }
        loadingText="Збереження..."
        confirmText={courseToHide?.shouldHide ? 'Зробити запланованим' : 'Зробити незапланованим'}
        itemName={courseToHide?.title ? `курс «${courseToHide.title}»` : 'цей курс'}
        variantColor="default"
        actionName={courseToHide?.shouldHide ? 'зробити запланованим' : 'зробити незапланованим'}
      />
    </>
  );
};
