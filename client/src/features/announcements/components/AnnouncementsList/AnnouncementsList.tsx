import React from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { AnnouncementItem } from '@/components/announcements/AnnouncementItem/AnnouncementItem.tsx';
import styles from '@/features/tasks/components/StudentSubmissionsList/StudentSubmissionsList.module.css';

export interface Announcement {
  id: string;
  authorName: string;
  announcementTitle: string;
  time: string;
  avatarUrl?: string;
  isUnread?: boolean;
}

interface AnnouncementsListProps {
  announcements: Announcement[];
  selectedId?: string;
  onItemClick?: (id: string) => void;
}

export const AnnouncementsList: React.FC<AnnouncementsListProps> = ({
  announcements,
  selectedId,
  onItemClick,
}) => {
  if (!announcements || announcements.length === 0) {
    return (
      <ContentCard>
        <p
          style={{
            fontSize: '14px',
            color: '#9CA3AF',
            margin: 0,
            textAlign: 'center',
            fontStyle: 'italic',
          }}
        >
          Немає оголошень для відображення.
        </p>
      </ContentCard>
    );
  }

  return (
    <ContentCard>
      <div className={styles.listContainer}>
        {announcements.map((announcement) => (
          <AnnouncementItem
            key={announcement.id}
            authorName={announcement.authorName}
            announcementTitle={announcement.announcementTitle}
            time={announcement.time}
            avatarUrl={announcement.avatarUrl}
            isUnread={announcement.isUnread}
            isActive={announcement.id === selectedId}
            onClick={() => onItemClick?.(announcement.id)}
          />
        ))}
      </div>
    </ContentCard>
  );
};
