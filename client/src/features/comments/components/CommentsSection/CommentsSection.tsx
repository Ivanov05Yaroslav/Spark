import React, { useState } from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { CommentInput } from '@/components/comments/CommentInput/CommentInput.tsx';
import { CommentItem } from '@/components/comments/CommentItem/CommentItem.tsx';
import { useComments } from '@/features/comments/hooks/useComments';
import { ReportModal } from '../../../../components/modals/ReportModal/ReportModal.tsx';
import styles from './CommentsSection.module.css';

interface CommentsSectionProps {
  testId?: string;
  taskId?: string;
  targetStudentId?: string;
  currentUserAvatar?: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  testId,
  taskId,
  targetStudentId,
  currentUserAvatar,
}) => {
  const { comments, addComment, editComment, deleteComment, complainComment } = useComments({
    testId,
    taskId,
    targetStudentId,
  });

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);

  const handleOpenReportModal = (commentId: string) => {
    setReportingCommentId(commentId);
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = (reason: string) => {
    if (reportingCommentId) {
      complainComment(reportingCommentId, reason);
    }
    setIsReportModalOpen(false);
    setReportingCommentId(null);
  };

  return (
    <div className={styles.section}>
      <ContentCard title="Приватні коментарі">
        <div className={styles.commentsList}>
          {comments.map((comment, index) => (
            <React.Fragment key={comment.id}>
              <CommentItem
                {...comment}
                onSaveEdit={comment.isEditable ? editComment : undefined}
                onDelete={comment.isEditable ? deleteComment : undefined}
                onComplaint={!comment.isOwner ? () => handleOpenReportModal(comment.id) : undefined}
              />
              {index < comments.length - 1 && <div className={styles.divider} />}
            </React.Fragment>
          ))}
        </div>

        <CommentInput currentUserAvatar={currentUserAvatar} onSubmit={addComment} />
      </ContentCard>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportingCommentId(null);
        }}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
};
