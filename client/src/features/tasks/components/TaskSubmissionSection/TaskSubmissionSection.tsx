import React, { useState } from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { FileCard } from '@/components/ui/FileCard/FileCard.tsx';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton.tsx';
import { IconActionButton } from '@/components/ui/IconActionButton/IconActionButton.tsx';
import { GradeInput } from '@/components/tasks/GradeInput/GradeInput';
import styles from './TaskSubmissionSection.module.css';
import UploadIcon from '@/assets/upload.svg?react';
import LinkIcon from '@/assets/link.svg?react';
import { GradeBadge } from '@/components/tasks/GradeBadge/GradeBadge.tsx';
import { UploadFilesModal } from '@/features/tasks/components/TaskAttachmentsSection/UploadFilesModal.tsx';
import { AddLinkModal } from '@/features/tasks/components/TaskAttachmentsSection/AddLinkModal.tsx';

interface SubmittedFile {
  id: string;
  name: string;
  url?: string;
}

interface TaskSubmissionSectionProps {
  status: 'Assigned' | 'Turned in' | 'Graded' | 'Missing';
  grade: string | number;
  maxGrade: number;
  submittedFiles: SubmittedFile[];
  onGradeChange?: (value: string) => void;
  onSubmitOrReturn?: () => void;
  onRemoveFile?: (fileId: string) => void;
  isTeacher?: boolean;
  onAddFile?: (file: File) => void;
  onAddLink?: (link: string) => void;
}

export const TaskSubmissionSection: React.FC<TaskSubmissionSectionProps> = ({
  status,
  grade,
  maxGrade,
  submittedFiles,
  onGradeChange,
  onAddFile,
  onAddLink,
  onSubmitOrReturn,
  onRemoveFile,
  isTeacher = false,
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadLinkModalOpen, setIsUploadLinkModalOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('');

  const getStatusClass = () => {
    switch (status) {
      case 'Turned in':
        return styles.statusTurnedIn;
      case 'Graded':
        return styles.statusGraded;
      case 'Missing':
        return styles.statusMissing;
      default:
        return styles.statusAssigned;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'Turned in':
        return 'Здано';
      case 'Graded':
        return 'Оцінено';
      case 'Missing':
        return 'Протерміновано';
      default:
        return 'Призначено';
    }
  };

  const handleFilesSelectFromModal = (newFiles: File[]) => {
    if (onAddFile) {
      newFiles.forEach((file) => onAddFile(file));
    }
  };

  const handleAddLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkInput.trim() && onAddLink) {
      onAddLink(linkInput.trim());
    }
    setIsUploadLinkModalOpen(false);
    setLinkInput('');
  };

  const handleUploadClick = () => setIsUploadModalOpen(true);
  const handleLinkClick = () => setIsUploadLinkModalOpen(true);

  const canEditFiles = !isTeacher && (status === 'Assigned' || status === 'Missing');

  return (
    <ContentCard
      title={isTeacher ? 'Робота студента' : 'Ваша робота'}
      headerRightComponent={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`${styles.statusLabel} ${getStatusClass()}`}>{getStatusLabel()}</span>
          {status === 'Missing' && <GradeBadge status="late" />}
        </div>
      }
    >
      {isTeacher && onGradeChange && (
        <div className={styles.gradeContainer} style={{ marginBottom: '16px' }}>
          <GradeInput value={grade} maxGrade={maxGrade} onChange={onGradeChange} />
        </div>
      )}

      <div className={styles.filesSection}>
        {submittedFiles.length > 0 ? (
          <div className={styles.filesGrid}>
            {submittedFiles.map((file) => (
              <FileCard
                key={file.id}
                fileName={file.name}
                previewUrl={file.url}
                onRemove={canEditFiles && onRemoveFile ? () => onRemoveFile(file.id) : undefined}
              />
            ))}
          </div>
        ) : (
          <p className={styles.noFiles}>Немає прикріплених файлів</p>
        )}
      </div>

      {canEditFiles && (
        <div className={styles.iconButtonsGroup}>
          <IconActionButton icon={<UploadIcon />} label="Завантажити" onClick={handleUploadClick} />
          <IconActionButton icon={<LinkIcon />} label="Посилання" onClick={handleLinkClick} />
        </div>
      )}

      <PrimaryButton onClick={onSubmitOrReturn} disabled={status === 'Graded' && !isTeacher}>
        {isTeacher ? 'Повернути роботу' : status === 'Turned in' ? 'Скасувати здачу' : 'Здати'}
      </PrimaryButton>

      <UploadFilesModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        uploadedFiles={[]}
        onFilesSelect={handleFilesSelectFromModal}
      />

      <AddLinkModal
        isOpen={isUploadLinkModalOpen}
        onClose={() => setIsUploadLinkModalOpen(false)}
        linkInput={linkInput}
        setLinkInput={setLinkInput}
        onSubmit={handleAddLinkSubmit}
      />
    </ContentCard>
  );
};
