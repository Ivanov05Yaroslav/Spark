import React, { useState, useEffect } from 'react';
import { ModalLayout } from '@/components/layout/ModalLayout/ModalLayout';
import { AvatarUpload } from '@/components/profile/AvatarUpload/AvatarUpload';
import { Input } from '@/components/ui/Input/Input';
import { SecondaryButton } from '@/components/ui/SecondaryButton/SecondaryButton';
import { useEditProfile } from '@/features/profile/hooks/useEditProfile';
import { toast } from '@/libs/configs/Toast.ts';
import styles from './EditProfileModal.module.css';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: {
    firstName: string;
    lastName: string;
    middleName: string;
    avatarUrl?: string | null;
  };
  userRoles?: string[];
}

type TabType = 'avatar' | 'name' | 'password';

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  userRoles = [],
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('avatar');
  const { updateProfile, changePassword, isLoading } = useEditProfile();

  const [files, setFiles] = useState<File[]>([]);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null | undefined>(
    initialData?.avatarUrl,
  );

  const [nameData, setNameData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    middleName: initialData?.middleName || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const canEditName = userRoles.some((role) => ['SUPER_ADMIN', 'PARENT', 'ADMIN'].includes(role));

  useEffect(() => {
    if (isOpen) {
      setCurrentAvatarUrl(initialData?.avatarUrl);
      setNameData({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        middleName: initialData?.middleName || '',
      });
      setFiles([]);
      if (!canEditName && activeTab === 'name') {
        setActiveTab('avatar');
      }
    }
  }, [isOpen, initialData, canEditName, activeTab]);

  const handleSave = async () => {
    if (activeTab === 'avatar' || activeTab === 'name') {
      const success = await updateProfile({
        firstName: nameData.firstName,
        lastName: nameData.lastName,
        middleName: nameData.middleName,
        avatarFile: files[0] || null,
        currentAvatarUrl: currentAvatarUrl,
      });

      if (success) {
        onSuccess?.();
        onClose();
      }
    }

    if (activeTab === 'password') {
      if (!passwordData.oldPassword || !passwordData.newPassword) {
        toast.error('Будь ласка, заповніть поля паролів');
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('Нові паролі не збігаються');
        return;
      }

      const success = await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      if (success) {
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        onSuccess?.();
        onClose();
      }
    }
  };

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose} title="Edit profile" width="780px">
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <button
            className={`${styles.tabButton} ${activeTab === 'avatar' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('avatar')}
            disabled={isLoading}
          >
            Avatar
          </button>

          {canEditName && (
            <button
              className={`${styles.tabButton} ${activeTab === 'name' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('name')}
              disabled={isLoading}
            >
              Change name
            </button>
          )}

          <button
            className={`${styles.tabButton} ${activeTab === 'password' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('password')}
            disabled={isLoading}
          >
            Change password
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'avatar' && (
            <div className={styles.avatarSection}>
              <AvatarUpload
                values={files}
                onFilesChange={setFiles}
                maxFiles={1}
                existingUrl={currentAvatarUrl}
                onRemoveExisting={() => setCurrentAvatarUrl(null)}
                showList={true}
              />
              <SecondaryButton
                variantColor="default"
                className={styles.saveButton}
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </SecondaryButton>
            </div>
          )}

          {activeTab === 'name' && canEditName && (
            <div className={styles.form}>
              <Input
                label="Прізвище"
                value={nameData.lastName}
                onChange={(e) => setNameData({ ...nameData, lastName: e.target.value })}
                disabled={isLoading}
              />
              <Input
                label="Ім'я"
                value={nameData.firstName}
                onChange={(e) => setNameData({ ...nameData, firstName: e.target.value })}
                disabled={isLoading}
              />
              <Input
                label="По батькові"
                value={nameData.middleName}
                onChange={(e) => setNameData({ ...nameData, middleName: e.target.value })}
                disabled={isLoading}
              />
              <SecondaryButton
                variantColor="default"
                className={styles.saveButton}
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save changes'}
              </SecondaryButton>
            </div>
          )}

          {activeTab === 'password' && (
            <div className={styles.form}>
              <Input
                label="Old password"
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                disabled={isLoading}
              />
              <Input
                label="New password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                disabled={isLoading}
              />
              <Input
                label="Confirm new password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                disabled={isLoading}
              />
              <SecondaryButton
                variantColor="default"
                className={styles.saveButton}
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update password'}
              </SecondaryButton>
            </div>
          )}
        </div>
      </div>
    </ModalLayout>
  );
};
