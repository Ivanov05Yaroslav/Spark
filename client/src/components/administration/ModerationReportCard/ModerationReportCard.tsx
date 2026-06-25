import React from 'react';
import { MessageBubble } from '@/components/chats/MessageBubble/MessageBubble';
import { ModerationUserBadge } from '@/components/administration/ModerationUserBadge/ModerationUserBadge';
import { ModerationActions } from '@/components/administration/ModerationActions/ModerationActions';
import styles from './ModerationReportCard.module.css';

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
  onDeleteMessage: (id: string) => void;
  onBlockUser: (id: string) => void;
  isPending?: boolean;
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
  onDeleteMessage,
  onBlockUser,
  isPending = false,
}) => {
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
        </div>

        <div className={styles.reasonBlock}>
          <span className={styles.label}>Причина скарги:</span>
          <p className={styles.reasonText}>{reportReason}</p>
        </div>

        <div className={styles.messageBlock}>
          <span className={styles.label}>Оскаржене повідомлення:</span>
          <div className={styles.bubbleWrapper}>
            <MessageBubble text={messageText} time={messageTime} position="left" />
          </div>
        </div>
      </div>

      <div className={styles.actionsSection}>
        <ModerationActions
          onApprove={() => onApprove(id)}
          onReject={() => onReject(id)}
          onDeleteMessage={() => onDeleteMessage(id)}
          onBlockUser={() => onBlockUser(id)}
          isPending={isPending}
        />
      </div>
    </div>
  );
};
