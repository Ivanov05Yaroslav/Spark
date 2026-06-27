import React, { useState, useEffect } from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { FileCard } from '@/components/ui/FileCard/FileCard.tsx';
import { GradeInput } from '@/components/tasks/GradeInput/GradeInput.tsx';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton.tsx';
import styles from './StudentWorkSection.module.css';

interface StudentWorkSectionProps {
  statusText?: string;
  submittedAt?: string | null;
  attachments?: string[];
  showGradeBlock?: boolean;
  gradeValue: string | number;
  onGradeChange: (value: string) => void;
  onGradeSubmit: () => void;
}

export const StudentWorkSection: React.FC<StudentWorkSectionProps> = ({
  statusText = 'Здано',
  submittedAt,
  attachments = [],
  showGradeBlock = false,
  gradeValue,
  onGradeChange,
  onGradeSubmit,
}) => {
  const [isEditingGrade, setIsEditingGrade] = useState(false);

  useEffect(() => {
    setIsEditingGrade(false);
  }, [statusText, submittedAt]);

  const getAttachmentName = (url: string): string => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const cleanUrl = decodedUrl.endsWith('/') ? decodedUrl.slice(0, -1) : decodedUrl;
      return cleanUrl.split('/').pop() || url;
    } catch {
      return url;
    }
  };

  const isGraded = statusText === 'Оцінено';
  const isInputDisabled = isGraded && !isEditingGrade;

  const handleButtonClick = () => {
    if (isGraded && !isEditingGrade) {
      setIsEditingGrade(true);
    } else {
      onGradeSubmit();
      setIsEditingGrade(false);
    }
  };

  const buttonText = isGraded && !isEditingGrade ? 'Змінити оцінку' : 'Зберегти оцінку';

  return (
    <ContentCard title={statusText} headerRightText={submittedAt || undefined}>
      <div className={styles.container}>
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

        {showGradeBlock && (
          <div className={styles.gradeSection}>
            <GradeInput
              value={gradeValue}
              onChange={onGradeChange}
              maxGrade={12}
              disabled={isInputDisabled}
            />
            <PrimaryButton onClick={handleButtonClick} className={styles.gradeButton}>
              {buttonText}
            </PrimaryButton>
          </div>
        )}
      </div>
    </ContentCard>
  );
};
