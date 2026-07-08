import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dot } from '@/components/notifications/Dot/Dot.tsx';
import { Avatar } from '../../../../components/ui/Avatar/Avatar.tsx';
import { ApiNotification } from '@/types/notifications.types.ts';
import styles from './NotificationItem.module.css';

type NotificationItemProps = {
  notification: ApiNotification;
  onItemClick: (id: string) => void;
  onCloseDrawer: () => void;
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onItemClick,
  onCloseDrawer,
}) => {
  const navigate = useNavigate();
  const { id, isRead, title, content, type, metadata, createdAt, sender } = notification;

  const handleContainerClick = () => {
    if (!isRead) {
      onItemClick(id);
    }

    onCloseDrawer();

    const { courseId, taskId, testId, submissionId, schoolId } = metadata || {};

    switch (type) {
      case 'WELCOME':
      case 'SECURITY_ALERT':
      case 'PARENT_LINKED':
      case 'WARNING':
        navigate('/profile');
        break;

      case 'NEW_COMPLAINT':
        navigate('/admin');
        break;

      case 'SCHOOL_APPROVED':
        navigate('/courses');
        break;

      case 'COURSE':
      case 'COURSE_ENROLLED':
      case 'CO_TEACHER_ASSIGNED':
      case 'MATERIAL':
      case 'MATERIAL_ADDED':
        if (courseId) {
          navigate(`/courses/${courseId}`);
        } else {
          navigate('/courses');
        }
        break;

      case 'ANNOUNCEMENT':
        if (courseId) {
          navigate(`/courses/${courseId}?tab=announcements`);
        } else {
          navigate('/courses');
        }
        break;

      case 'TASK':
      case 'GRADE':
      case 'OVERDUE':
      case 'OVERDUE_PARENT':
        if (courseId && taskId) {
          navigate(`/courses/${courseId}/tasks/${taskId}`);
        } else if (courseId) {
          navigate(`/courses/${courseId}`);
        }
        break;

      case 'TEST':
      case 'TEST_CREATED':
      case 'DEADLINE_CHANGED':
        if (courseId && testId) {
          navigate(`/courses/${courseId}/tests/${testId}`);
        } else if (courseId) {
          navigate(`/courses/${courseId}`);
        }
        break;

      case 'DEADLINE':
        if (courseId) {
          if (taskId) navigate(`/courses/${courseId}/tasks/${taskId}`);
          else if (testId) navigate(`/courses/${courseId}/tests/${testId}`);
          else navigate(`/courses/${courseId}`);
        }
        break;

      case 'SUBMISSION_CREATED':
      case 'SUBMISSION':
        if (courseId) {
          if (testId && submissionId) {
            navigate(`/courses/${courseId}/tests/${testId}/review/${submissionId}`);
          } else if (testId) {
            navigate(`/courses/${courseId}/tests/${testId}`);
          } else if (taskId) {
            navigate(`/courses/${courseId}/tasks/${taskId}`);
          } else {
            navigate(`/courses/${courseId}`);
          }
        }
        break;

      case 'COMMENT':
        if (courseId) {
          if (taskId) navigate(`/courses/${courseId}/tasks/${taskId}`);
          else if (testId) navigate(`/courses/${courseId}/tests/${testId}`);
          else navigate(`/courses/${courseId}`);
        }
        break;

      default:
        if (courseId) navigate(`/courses/${courseId}`);
        break;
    }
  };

  const formattedDate = new Date(createdAt).toLocaleString('uk-UA', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  const fullName = `${sender.firstName} ${sender.lastName}`;

  return (
    <div
      className={`${styles.itemContainer} ${isRead ? styles.read : ''}`}
      onClick={handleContainerClick}
      style={{ cursor: 'pointer' }}
    >
      {!isRead && <Dot className={styles.notificationDot} />}

      <div className={styles.content}>
        <div className={styles.messageRow}>
          <div className={styles.messageTextBlock}>
            <p className={styles.messageText}>{content}</p>
          </div>
          <Avatar src={sender.avatarUrl} size={32} />
        </div>

        <div className={styles.metaRow}>
          <span className={styles.senderName}>{fullName}</span>
          <span className={styles.date}>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
