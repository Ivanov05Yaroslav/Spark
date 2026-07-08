import React from 'react';
import { MessageBubble } from '@/components/administration/MessageBubble/MessageBubble';
import { ModerationUserBadge } from '@/components/administration/ModerationUserBadge/ModerationUserBadge';
import { ModerationActions } from '@/components/administration/ModerationActions/ModerationActions';
import styles from './ModerationReportCard.module.css';

export type ModerationStatus = 'PENDING' | 'RESOLVED' | 'REJECTED' | 'BLOCKED';

interface ModerationUser {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role: string;
  roleLabel: string;
  avatarUrl?: string;
}

export interface ModerationReportCardProps {
  id: string;
  reporter: ModerationUser;
  reportedUser: ModerationUser;
  reportReason: string;
  messageText: string;
  messageTime?: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onBlockUser: (id: string) => void;
  isPending?: boolean;
  status: ModerationStatus;
}

export const ModerationReportCard: React.FC<ModerationReportCardProps> = ({
  id,
  reporter,
  reportedUser,
  reportReason,
  messageText,
  messageTime,
  onApprove,
  onReject,
  onBlockUser,
  isPending = false,
  status,
}) => {
  const statusConfig: Record<
    ModerationStatus,
    { label: string; className: string; dotClassName: string }
  > = {
    PENDING: {
      label: 'Очікує розгляду',
      className: styles.statusPending,
      dotClassName: styles.dotPending,
    },
    RESOLVED: {
      label: 'Вирішено',
      className: styles.statusResolved,
      dotClassName: styles.dotResolved,
    },
    REJECTED: {
      label: 'Відхилено',
      className: styles.statusRejected,
      dotClassName: styles.dotRejected,
    },
    BLOCKED: {
      label: 'Заблоковано',
      className: styles.statusBlocked,
      dotClassName: styles.dotBlocked,
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className={styles.card}>
      <div className={styles.infoSection}>
        <div className={styles.usersRow}>
          <ModerationUserBadge
            label="Автор скарги:"
            firstName={reporter.firstName}
            lastName={reporter.lastName}
            middleName={reporter.middleName}
            role={reporter.role}
            roleLabel={reporter.roleLabel}
            avatarUrl={reporter.avatarUrl}
          />

          <ModerationUserBadge
            label="Порушник:"
            firstName={reportedUser.firstName}
            lastName={reportedUser.lastName}
            middleName={reportedUser.middleName}
            role={reportedUser.role}
            roleLabel={reportedUser.roleLabel}
            avatarUrl={reportedUser.avatarUrl}
          />

          {currentStatus && (
            <div className={`${styles.statusBadge} ${currentStatus.className}`}>
              <span className={`${styles.statusDot} ${currentStatus.dotClassName}`}></span>
              {currentStatus.label}
            </div>
          )}
        </div>

        <div className={styles.reasonBlock}>
          <span className={styles.label}>Причина скарги:</span>
          <p className={styles.reasonText}>{reportReason}</p>
        </div>

        <div className={styles.messageBlock}>
          <span className={styles.label}>Оскаржене повідомлення:</span>
          {messageText === 'Повідомлення відсутнє' ? (
            <div className={styles.emptyMessageState}>{messageText}</div>
          ) : (
            <MessageBubble text={messageText} time={messageTime} position="left" />
          )}
        </div>
      </div>

      {status === 'PENDING' && (
        <div className={styles.actionsSection}>
          <ModerationActions
            onApprove={() => onApprove(id)}
            onReject={() => onReject(id)}
            onBlockUser={() => onBlockUser(id)}
            isPending={isPending}
          />
        </div>
      )}
    </div>
  );
};
