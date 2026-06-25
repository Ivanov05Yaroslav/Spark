import React from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { FileCard } from '@/components/ui/FileCard/FileCard.tsx';
import styles from './StudentWorkSection.module.css';

interface StudentWorkSectionProps {
  statusText?: string;
  submittedAt?: string | null;
  attachments?: string[];
}

export const StudentWorkSection: React.FC<StudentWorkSectionProps> = ({
  statusText = 'Здано',
  submittedAt,
  attachments = [],
}) => {
  const getAttachmentName = (url: string): string => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const cleanUrl = decodedUrl.endsWith('/') ? decodedUrl.slice(0, -1) : decodedUrl;
      return cleanUrl.split('/').pop() || url;
    } catch {
      return url;
    }
  };

  return (
    <ContentCard title={statusText} headerRightText={submittedAt || undefined}>
      {attachments && attachments.length > 0 ? (
        <div className={styles.attachmentsGrid}>
          {attachments.map((attachmentUrl, index) => (
            <a
              key={index}
              href={attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.attachmentLink}
            >
              <FileCard fileName={getAttachmentName(attachmentUrl)} />
            </a>
          ))}
        </div>
      ) : (
        <p className={styles.noFiles}>Студент не прикріпив жодного файлу.</p>
      )}
    </ContentCard>
  );
};
