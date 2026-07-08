import React, { useState } from 'react';
import {
  AnnouncementsList,
  Announcement,
} from '@/features/announcements/components/AnnouncementsList/AnnouncementsList';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard/AnnouncementCard';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal/ConfirmDeleteModal.tsx';
import styles from './AnnouncementsWorkspace.module.css';

export interface DetailedAnnouncement extends Announcement {
  content: string | React.ReactNode;
}

interface AnnouncementsWorkspaceProps {
  announcements: DetailedAnnouncement[];
  selectedId?: string;
  onItemClick?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onComplaint?: (id: string) => void;
  showMoreMenu: boolean;
}

export const AnnouncementsWorkspace: React.FC<AnnouncementsWorkspaceProps> = ({
  announcements,
  selectedId,
  onItemClick,
  onEdit,
  onDelete,
  onComplaint,
  showMoreMenu,
}) => {
  const selectedAnnouncement = announcements.find((a) => a.id === selectedId);

  const [activeAnnouncementToDelete, setActiveAnnouncementToDelete] =
    useState<DetailedAnnouncement | null>(null);

  const handleConfirmDelete = async () => {
    if (activeAnnouncementToDelete && onDelete) {
      await onDelete(activeAnnouncementToDelete.id);
      setActiveAnnouncementToDelete(null);
    }
  };

  return (
    <div className={styles.workspaceGrid}>
      <div className={styles.leftColumn}>
        <AnnouncementsList
          announcements={announcements}
          selectedId={selectedId}
          onItemClick={onItemClick}
        />
      </div>

      <div className={styles.rightColumn}>
        {selectedAnnouncement ? (
          <AnnouncementCard
            authorName={selectedAnnouncement.authorName}
            announcementTitle={selectedAnnouncement.announcementTitle}
            time={selectedAnnouncement.time}
            content={selectedAnnouncement.content}
            avatarUrl={selectedAnnouncement.avatarUrl}
            onEdit={onEdit ? () => onEdit(selectedAnnouncement.id) : undefined}
            onDelete={
              onDelete ? () => setActiveAnnouncementToDelete(selectedAnnouncement) : undefined
            }
            onComplaint={onComplaint ? () => onComplaint(selectedAnnouncement.id) : undefined}
            showMoreMenu={showMoreMenu}
          />
        ) : (
          <div className={styles.emptySelection}>
            <p>Оберіть оголошення зі списку ліворуч, щоб переглянути його деталі.</p>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={!!activeAnnouncementToDelete}
        onClose={() => setActiveAnnouncementToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={activeAnnouncementToDelete?.announcementTitle || 'це оголошення'}
      />
    </div>
  );
};
