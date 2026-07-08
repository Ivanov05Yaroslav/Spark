import React from 'react';
import { SecondaryButton } from '@/components/ui/SecondaryButton/SecondaryButton';
import styles from '@/components/administration/ModerationActions/ModerationActions.module.css';
import ApproveIcon from '@/assets/approve.svg?react';
import RejectIcon from '@/assets/block.svg?react';
interface RegistrationActionsProps {
  onApprove: () => void;
  onReject: () => void;
  isPending?: boolean;
}

export const RegistrationActions: React.FC<RegistrationActionsProps> = ({
  onApprove,
  onReject,
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
        variantColor="red"
        onClick={onReject}
        disabled={isPending}
        icon={<RejectIcon />}
        className={styles.actionBtn}
      >
        Відхилити
      </SecondaryButton>
    </div>
  );
};
