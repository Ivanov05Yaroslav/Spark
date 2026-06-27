import React, { useState } from 'react';
import PlusIcon from '@/assets/plus.svg?react';
import { InfoItem } from '@/components/ui/InfoItem/InfoItem';
import styles from './OnlineLessonsBlock.module.css';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { LinkUploadModal } from '@/features/courses/components/OnlineLessonsBlock/LinkUploadModal.tsx';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal/ConfirmDeleteModal.tsx';
import VideoIcon from '@/assets/video.svg?react';

export interface OnlineLessonLink {
  id: string;
  url: string;
  title?: string;
}

interface OnlineLessonsBlockProps {
  links: OnlineLessonLink[];
  onAdd?: (url: string) => void;
  onEditLink?: (id: string, url: string) => void;
  onDeleteLink?: (id: string) => void;
}

export const OnlineLessonsBlock: React.FC<OnlineLessonsBlockProps> = ({
  links,
  onAdd,
  onEditLink,
  onDeleteLink,
}) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);

  const handleAddClick = () => {
    setEditingLinkId(null);
    setLinkInput('');
    setIsLinkModalOpen(true);
  };

  const handleEditClick = (id: string) => {
    const linkToEdit = links.find((item) => item.id === id);
    if (linkToEdit) {
      setEditingLinkId(id);
      setLinkInput(linkToEdit.url);
      setIsLinkModalOpen(true);
    }
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim()) return;

    if (editingLinkId) {
      onEditLink?.(editingLinkId, linkInput.trim());
    } else {
      onAdd?.(linkInput.trim());
    }

    setIsLinkModalOpen(false);
    setEditingLinkId(null);
    setLinkInput('');
  };

  const handleDeleteClick = (id: string) => {
    setDeletingLinkId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingLinkId) {
      onDeleteLink?.(deletingLinkId);
    }
    setIsDeleteModalOpen(false);
    setDeletingLinkId(null);
  };

  const getServiceNameFromUrl = (url: string): string => {
    try {
      const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
      const { hostname } = new URL(cleanUrl);

      const parts = hostname.split('.');

      const domainWord = parts[0] === 'www' ? parts[1] : parts[0];

      if (!domainWord) return 'Link';

      return domainWord.charAt(0).toUpperCase() + domainWord.slice(1);
    } catch {
      return 'Link';
    }
  };

  const truncateMiddle = (text: string, maxLength: number = 30): string => {
    if (!text || text.length <= maxLength) return text;

    const charsToShow = maxLength - 3;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);

    return text.slice(0, frontChars) + '...' + text.slice(text.length - backChars);
  };

  return (
    <ContentCard
      title="Посилання на онлайн-уроки"
      headerRightComponent={
        onAdd ? (
          <button
            className={styles.addButton}
            onClick={handleAddClick}
            aria-label="Додати онлайн-урок"
          >
            <PlusIcon className={styles.plusIcon} />
          </button>
        ) : null
      }
    >
      {links.length > 0 ? (
        <div className={styles.linksList}>
          {links.map((link) => {
            const dynamicTitle = getServiceNameFromUrl(link.url);
            const truncatedUrl = truncateMiddle(link.url, 40);

            return (
              <div key={link.id} className={styles.linkItem}>
                <InfoItem
                  icon={VideoIcon}
                  title={link.title || dynamicTitle}
                  subtitle={truncatedUrl}
                  linkUrl={link.url}
                  showMoreMenu={!!onEditLink || !!onDeleteLink}
                  onEdit={() => handleEditClick(link.id)}
                  onDelete={() => handleDeleteClick(link.id)}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>Немає доданих посилань</div>
      )}

      <LinkUploadModal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          setEditingLinkId(null);
          setLinkInput('');
        }}
        linkInput={linkInput}
        setLinkInput={setLinkInput}
        onSubmit={handleLinkSubmit}
        isEdit={editingLinkId !== null}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingLinkId(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName="це посилання"
      />
    </ContentCard>
  );
};
