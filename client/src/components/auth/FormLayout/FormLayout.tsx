import React from 'react';
import { Title } from '../Title/Title.tsx';
import { PrimaryButton } from '../../ui/PrimaryButton/PrimaryButton.tsx';
import styles from './FormLayout.module.css';

interface AuthFormLayoutProps {
  title: string;
  error: string | null;
  isLoading: boolean;
  submitButtonText: string;
  loadingButtonText: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  links?: React.ReactNode;
  showSocial?: boolean;
  isSubmitDisabled?: boolean;
}

export const FormLayout: React.FC<AuthFormLayoutProps> = ({
  title,
  error,
  isLoading,
  submitButtonText,
  loadingButtonText,
  onSubmit,
  children,
  links,
  showSocial = true,
  isSubmitDisabled = false,
}) => {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <Title className={styles.title}>{title}</Title>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.inputsGroup}>{children}</div>

      <PrimaryButton type="submit" disabled={isLoading || isSubmitDisabled}>
        {isLoading ? loadingButtonText : submitButtonText}
      </PrimaryButton>

      {links}
    </form>
  );
};
