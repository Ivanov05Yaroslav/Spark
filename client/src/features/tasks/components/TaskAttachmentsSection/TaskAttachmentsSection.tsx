import React from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard';
import { FileCard } from '@/components/ui/FileCard/FileCard';
import { IconActionButton } from '@/components/ui/IconActionButton/IconActionButton';
import UploadIcon from '@/assets/upload.svg?react';
import LinkIcon from '@/assets/link.svg?react';

import { UploadFilesModal } from '@/features/tasks/components/TaskAttachmentsSection/UploadFilesModal.tsx';
import { AddLinkModal } from '@/features/tasks/components/TaskAttachmentsSection/AddLinkModal.tsx'
import { UploadedLink } from "@/types/tasks.types.ts";
import styles from './TaskAttachmentsSection.module.css';

interface TaskAttachmentsSectionProps {
    filesState: {
        uploadedFiles: File[];
        isUploadModalOpen: boolean;
        setIsUploadModalOpen: (isOpen: boolean) => void;
        handleFilesSelectFromModal: (newFiles: File[]) => void;
        handleRemoveFile: (indexToRemove: number) => void;
    };
    linksState: {
        uploadedLinks: UploadedLink[];
        isUploadLinkModalOpen: boolean;
        setIsUploadLinkModalOpen: (isOpen: boolean) => void;
        linkInput: string;
        setLinkInput: (value: string) => void;
        handleAddLink: (e: React.FormEvent) => void;
        handleRemoveLink: (indexToRemove: number) => void;
    };
}

export const TaskAttachmentsSection: React.FC<TaskAttachmentsSectionProps> = ({
                                                                                  filesState,
                                                                                  linksState
                                                                              }) => {
    return (
        <ContentCard>
            {(filesState.uploadedFiles.length > 0 || linksState.uploadedLinks.length > 0) && (
                <>
                    {filesState.uploadedFiles.map((file, index) => (
                        <FileCard
                            key={`file-${index}`}
                            fileName={file.name}
                            onRemove={() => filesState.handleRemoveFile(index)}
                        />
                    ))}

                    {linksState.uploadedLinks.map((link, index) => (
                        <FileCard
                            key={`link-${index}`}
                            fileName={link.url}
                            onRemove={() => linksState.handleRemoveLink(index)}
                        />
                    ))}
                </>
            )}

            <div className={styles.iconButtonsGroup}>
                <IconActionButton
                    icon={<UploadIcon />}
                    label="Завантажити"
                    onClick={() => filesState.setIsUploadModalOpen(true)}
                />
                <IconActionButton
                    icon={<LinkIcon />}
                    label="Посилання"
                    onClick={() => linksState.setIsUploadLinkModalOpen(true)}
                />
            </div>

            <UploadFilesModal
                isOpen={filesState.isUploadModalOpen}
                onClose={() => filesState.setIsUploadModalOpen(false)}
                uploadedFiles={filesState.uploadedFiles}
                onFilesSelect={filesState.handleFilesSelectFromModal}
            />

            <AddLinkModal
                isOpen={linksState.isUploadLinkModalOpen}
                onClose={() => linksState.setIsUploadLinkModalOpen(false)}
                linkInput={linksState.linkInput}
                setLinkInput={linksState.setLinkInput}
                onSubmit={linksState.handleAddLink}
            />
        </ContentCard>
    );
};