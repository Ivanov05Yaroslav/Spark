import React from 'react';
import { SecondaryButton } from '@/components/ui/SecondaryButton/SecondaryButton';
import styles from './ModerationActions.module.css';

import ApproveIcon from '@/assets/approve.svg?react';
import RejectIcon from '@/assets/reject.svg?react';
import DeleteIcon from '@/assets/delete.svg?react';
import BlockIcon from '@/assets/block.svg?react';

interface ModerationActionsProps {
  onApprove: () => void;
  onReject: () => void;
  onDeleteMessage: () => void;
  onBlockUser: () => void;
  isPending?: boolean;
}

export const ModerationActions: React.FC<ModerationActionsProps> = ({
  onApprove,
  onReject,
  onDeleteMessage,
  onBlockUser,
  isPending = false,
}) => {
  return (
    <div className={styles.actionsStack}>
      <SecondaryButton
        variantColor="green"
        onClick={onApprove}
        disabled={isPending}
        icon={<ApproveIcon />}
        className={styles.actionBtn}
      >
        Схвалити
      </SecondaryButton>

      <SecondaryButton
        variantColor="default"
        onClick={onReject}
        disabled={isPending}
        icon={<RejectIcon />}
        className={styles.actionBtn}
      >
        Відхилити
      </SecondaryButton>

      <SecondaryButton
        variantColor="yellow"
        onClick={onBlockUser}
        disabled={isPending}
        icon={<BlockIcon />}
        className={styles.actionBtn}
      >
        Заблокувати
      </SecondaryButton>

      <SecondaryButton
        variantColor="red"
        onClick={onDeleteMessage}
        disabled={isPending}
        icon={<DeleteIcon />}
        className={styles.actionBtn}
      >
        Видалити
      </SecondaryButton>
    </div>
  );
};
