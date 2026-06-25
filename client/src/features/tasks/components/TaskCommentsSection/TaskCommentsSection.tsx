import React from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard';
import { CommentInput } from '@/components/tasks/CommentInput/CommentInput';
import { CommentItem, CommentProps } from '@/components/tasks/CommentItem/CommentItem';
import styles from './TaskCommentsSection.module.css';

interface TaskCommentsSectionProps {
  comments: CommentProps[];
  currentUserAvatar?: string;
  onAddComment: (content: string) => void;
  onEditComment?: (id: string) => void;
  onDeleteComment?: (id: string) => void;
}

export const TaskCommentsSection: React.FC<TaskCommentsSectionProps> = ({
  comments,
  currentUserAvatar,
  onAddComment,
  onEditComment,
  onDeleteComment,
}) => {
  return (
    <div className={styles.section}>
      <ContentCard title="Коментарі класу">
        <div className={styles.commentsList}>
          {comments.map((comment, index) => (
            <React.Fragment key={comment.id}>
              <CommentItem {...comment} onEdit={onEditComment} onDelete={onDeleteComment} />
              {index < comments.length - 1 && <div className={styles.divider} />}
            </React.Fragment>
          ))}
        </div>

        <CommentInput currentUserAvatar={currentUserAvatar} onSubmit={onAddComment} />
      </ContentCard>
    </div>
  );
};
