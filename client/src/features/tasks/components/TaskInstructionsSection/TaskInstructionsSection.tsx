import React from 'react';
import { useParams } from 'react-router-dom';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { FileCard } from '@/components/ui/FileCard/FileCard.tsx';
import { useTaskInstructions } from '@/features/tasks/hooks/useTaskInstructions';
import styles from './TaskInstructionsSection.module.css';

export const TaskInstructionsSection: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { task, isLoading, error } = useTaskInstructions(taskId);

  const getAttachmentName = (url: string): string => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const cleanUrl = decodedUrl.endsWith('/') ? decodedUrl.slice(0, -1) : decodedUrl;
      return cleanUrl.split('/').pop() || url;
    } catch {
      return url;
    }
  };

  const formatDeadline = (deadlineStr: string | null | undefined): string | null => {
    if (!deadlineStr) return null;
    const date = new Date(deadlineStr);

    const dateString = date.toLocaleDateString('uk-UA', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const timeString = date.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `Термін: ${dateString} о ${timeString}`;
  };

  const handleAttachmentClick = async (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    const isS3File = url.includes('spark-school-system-bucket.s3');

    if (isS3File) {
      e.preventDefault();

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = getAttachmentName(url);
        document.body.appendChild(downloadLink);

        downloadLink.click();

        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error('Ошибка при скачивании файла, открываем в новой вкладке:', error);
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  if (isLoading) {
    return (
      <ContentCard title="Вказівки">
        <p>Завантаження інструкцій...</p>
      </ContentCard>
    );
  }

  if (error || !task) {
    return (
      <ContentCard title="Вказівки">
        <p className={styles.noDescription}>{error || 'Завдання не знайдено.'}</p>
      </ContentCard>
    );
  }

  const formattedDeadline = formatDeadline(task.deadline);

  return (
    <ContentCard title="Вказівки" headerRightText={formattedDeadline || 'Термін не встановлено'}>
      <div className={styles.description}>
        {task.description ? (
          task.description.split('\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)
        ) : (
          <p className={styles.noDescription}>Вказівки до завдання відсутні.</p>
        )}
      </div>

      {task.attachments && task.attachments.length > 0 && (
        <div className={styles.attachmentsGrid}>
          {task.attachments.map((attachmentUrl, index) => (
            <a
              key={index}
              href={attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.attachmentLink}
              onClick={(e) => handleAttachmentClick(e, attachmentUrl)}
            >
              <FileCard fileName={getAttachmentName(attachmentUrl)} />
            </a>
          ))}
        </div>
      )}
    </ContentCard>
  );
};
