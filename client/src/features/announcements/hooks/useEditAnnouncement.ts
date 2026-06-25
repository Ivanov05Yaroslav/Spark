import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { announcementService } from '@/api/announcements.service';
import { courseService } from '@/api/courses.service';
import { toast } from '@/libs/configs/Toast';

export const useEditAnnouncement = () => {
  const navigate = useNavigate();
  const { id, announcementId } = useParams<{ id: string; announcementId: string }>();

  const [topicName, setTopicName] = useState('');
  const [text, setText] = useState('');

  const courseQuery = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseService.getCourseById(id!),
    enabled: !!id,
  });

  const announcementQuery = useQuery({
    queryKey: ['announcement', announcementId],
    queryFn: () => announcementService.getAnnouncementById(announcementId!),
    enabled: !!announcementId,
  });

  useEffect(() => {
    if (announcementQuery.data) {
      setTopicName(announcementQuery.data.title || '');
      setText(announcementQuery.data.content || '');
    }
  }, [announcementQuery.data]);

  const updateAnnouncementMutation = useMutation({
    mutationFn: (data: any) => announcementService.updateAnnouncement(announcementId!, data),
    onSuccess: () => {
      toast.success('Оголошення успішно збережено!');

      setTimeout(() => {
        navigate(`/courses/${id}/announcements`);
      }, 1500);
    },
    onError: (error) => {
      toast.error('Не вдалося зберегти зміни');
      console.error(error);
    },
  });

  const subjectOptions = courseQuery.data?.subject
    ? [{ value: courseQuery.data.subject.id, label: courseQuery.data.subject.name }]
    : [];

  const classOptions = courseQuery.data?.class
    ? [{ value: courseQuery.data.class.id, label: courseQuery.data.class.name }]
    : [];

  const handleUpdate = () => {
    if (!isFormValid || updateAnnouncementMutation.isPending || !id || !announcementId) return;

    updateAnnouncementMutation.mutate({
      courseId: id,
      title: topicName.trim(),
      content: text.trim(),
    });
  };

  const isFormValid = !!id && !!topicName.trim() && !!text.trim();
  const isLoadingData = courseQuery.isLoading || announcementQuery.isLoading;
  const isSubmitting = updateAnnouncementMutation.isPending;

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
      handleUpdate,
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
