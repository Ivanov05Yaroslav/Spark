import React, { useState } from 'react';
import { ModerationUserBadge } from '@/components/administration/ModerationUserBadge/ModerationUserBadge';
import { RegistrationActions } from '@/components/administration/RegistrationActions/RegistrationActions';
import { FileCard } from '@/components/ui/FileCard/FileCard';
import { RejectReasonModal } from './RejectReasonModal';
import styles from './SchoolRegistrationRequestCard.module.css';

export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface RegistrationApplicant {
  firstName: string;
  lastName: string;
  middleName?: string;
  avatarUrl?: string;
}

export interface AttachedDocument {
  id: string;
  fileName: string;
  fileUrl: string;
}

export interface SchoolRegistrationRequestCardProps {
  id: string;
  applicant: RegistrationApplicant;
  schoolName: string;
  schoolAddress: string;
  edboNumber: string;
  documents: AttachedDocument[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isPending?: boolean;
  status: RegistrationStatus;
}

export const SchoolRegistrationRequestCard: React.FC<SchoolRegistrationRequestCardProps> = ({
  id,
  applicant,
  schoolName,
  schoolAddress,
  edboNumber,
  documents,
  onApprove,
  onReject,
  isPending = false,
  status,
}) => {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const statusConfig: Record<
    RegistrationStatus,
    { label: string; className: string; dotClassName: string }
  > = {
    PENDING: {
      label: 'Очікує розгляду',
      className: styles.statusPending,
      dotClassName: styles.dotPending,
    },
    APPROVED: {
      label: 'Схвалено',
      className: styles.statusApproved,
      dotClassName: styles.dotApproved,
    },
    REJECTED: {
      label: 'Відхилено',
      className: styles.statusRejected,
      dotClassName: styles.dotRejected,
    },
  };

  const currentStatus = statusConfig[status];

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReject(id, rejectReason);
    setIsRejectModalOpen(false);
    setRejectReason('');
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.infoSection}>
          <div className={styles.usersRow}>
            <ModerationUserBadge
              label="Заявник:"
              firstName={applicant.firstName}
              lastName={applicant.lastName}
              middleName={applicant.middleName}
              role="APPLICANT"
              roleLabel="Заявник"
              avatarUrl={applicant.avatarUrl}
              showRoleLabel={false}
            />

            {currentStatus && (
              <div className={`${styles.statusBadge} ${currentStatus.className}`}>
                <span className={`${styles.statusDot} ${currentStatus.dotClassName}`}></span>
                {currentStatus.label}
              </div>
            )}
          </div>

          <div className={styles.schoolBlock}>
            <div className={styles.schoolInfo}>
              <span className={styles.label}>Заклад освіти:</span>
              <h3 className={styles.text}>{schoolName}</h3>
              <p className={styles.text}>{schoolAddress}</p>
            </div>
            <div className={styles.edboWrapper}>
              <span className={styles.label}>ЄДЕБО:</span>
              <span className={styles.text}>{edboNumber}</span>
            </div>
          </div>

          {documents && documents.length > 0 && (
            <div className={styles.documentsBlock}>
              <span className={styles.label}>Прикріплені документи:</span>
              <div className={styles.documentsList}>
                {documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.attachmentLink}
                  >
                    <FileCard fileName={doc.fileName} previewUrl={doc.fileUrl} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {status === 'PENDING' && (
          <div className={styles.actionsSection}>
            <RegistrationActions
              onApprove={() => onApprove(id)}
              onReject={() => setIsRejectModalOpen(true)}
              isPending={isPending}
            />
          </div>
        )}
      </div>

      <RejectReasonModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        reason={rejectReason}
        setReason={setRejectReason}
        onSubmit={handleRejectSubmit}
        isLoading={isPending}
      />
    </>
  );
};
