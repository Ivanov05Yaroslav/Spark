import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { announcementService } from '@/api/announcements.service';
import { courseService } from '@/api/courses.service';
import { toast } from '@/libs/configs/Toast';

export const useCreateAnnouncement = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [topicName, setTopicName] = useState('');
  const [text, setText] = useState('');

  const courseQuery = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseService.getCourseById(id!),
    enabled: !!id,
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: announcementService.createAnnouncement,
    onSuccess: () => {
      toast.success('Оголошення успішно створено!');

      setTimeout(() => {
        navigate(`/courses/${id}/announcements`);
      }, 1500);
    },
    onError: (error) => {
      toast.error('Не вдалося створити оголошення');
      console.error(error);
    },
  });

  const subjectOptions = courseQuery.data?.subject
    ? [{ value: courseQuery.data.subject.id, label: courseQuery.data.subject.name }]
    : [];

  const classOptions = courseQuery.data?.class
    ? [{ value: courseQuery.data.class.id, label: courseQuery.data.class.name }]
    : [];

  const handleCreate = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!isFormValid || createAnnouncementMutation.isPending || !id) return;

    createAnnouncementMutation.mutate({
      courseId: id,
      title: topicName.trim(),
      content: text.trim(),
    });
  };

  const isFormValid = !!id && !!topicName.trim() && !!text.trim();
  const isLoadingData = courseQuery.isLoading;
  const isSubmitting = createAnnouncementMutation.isPending;

  return {
    values: {
      subjectId: courseQuery.data?.subject?.id,
      classId: courseQuery.data?.class?.id,
      topicName,
      text,
    },
    handlers: {
      setTopicName,
      setText,
      handleCreate,
    },
    data: {
      subjectOptions,
      classOptions,
    },
    isFormValid,
    isLoadingData,
    isSubmitting,
  };
};
