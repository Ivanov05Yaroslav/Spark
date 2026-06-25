// import React from 'react';
// import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
// import { FileCard } from '@/components/ui/FileCard/FileCard.tsx';
// import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton.tsx';
// import { IconActionButton } from '@/components/ui/IconActionButton/IconActionButton.tsx';
// import { GradeInput } from '@/components/tasks/GradeInput/GradeInput';
// import styles from './TaskSubmissionSection.module.css';
// import UploadIcon from '@/assets/upload.svg?react';
// import LinkIcon from '@/assets/link.svg?react';
// import {GradeBadge} from "@/components/tasks/GradeBadge/GradeBadge.tsx";
//
// interface SubmittedFile {
//     id: string;
//     name: string;
//     url?: string;
// }
//
// interface TaskSubmissionSectionProps {
//     status: 'Assigned' | 'Turned in' | 'Graded' | 'Missing';
//     grade: string | number;
//     maxGrade: number;
//     submittedFiles: SubmittedFile[];
//     onGradeChange?: (value: string) => void;
//     onAddFile?: () => void;
//     onSubmitOrReturn?: () => void;
//     onRemoveFile?: (fileId: string) => void;
//     isTeacher?: boolean;
// }
//
// export const TaskSubmissionSection: React.FC<TaskSubmissionSectionProps> = ({
//                                                                                 status,
//                                                                                 grade,
//                                                                                 maxGrade,
//                                                                                 submittedFiles,
//                                                                                 onGradeChange,
//                                                                                 onAddFile,
//                                                                                 onSubmitOrReturn,
//                                                                                 onRemoveFile,
//                                                                                 isTeacher = false
//                                                                             }) => {
//
//     const getStatusClass = () => {
//         switch (status) {
//             case 'Turned in': return styles.statusTurnedIn;
//             case 'Graded': return styles.statusGraded;
//             case 'Missing': return styles.statusMissing;
//             default: return styles.statusAssigned;
//         }
//     };
//
//     return (
//         <ContentCard
//             title={isTeacher ? "Student's work" : "Your work"}
//             headerRightComponent={<GradeBadge  status="late" />}
//         >
//
//             <div className={styles.filesSection}>
//                 {submittedFiles.length > 0 ? (
//                     <div className={styles.filesGrid}>
//                         {submittedFiles.map((file) => (
//                             <FileCard
//                                 key={file.id}
//                                 fileName={file.name}
//                                 previewUrl={file.url}
//                                 onRemove={onRemoveFile ? () => onRemoveFile(file.id) : undefined}
//                             />
//                         ))}
//                     </div>
//                 ) : (
//                     <p className={styles.noFiles}>No files attached</p>
//                 )}
//             </div>
//
//             <div className={styles.iconButtonsGroup}>
//                 <IconActionButton
//                     icon={<UploadIcon/>}
//                     label="Завантажити"
//                     onClick={() => filesState.setIsUploadModalOpen(true)}
//                 />
//                 <IconActionButton
//                     icon={<LinkIcon/>}
//                     label="Посилання"
//                     onClick={() => linksState.setIsUploadLinkModalOpen(true)}
//                 />
//             </div>
//
//             <PrimaryButton
//                 onClick={onSubmitOrReturn}
//                 disabled={status === 'Graded' && !isTeacher}
//             >
//                 {isTeacher ? "Return work" : (status === 'Turned in' ? "Unsubmit" : "Turn in")}
//             </PrimaryButton>
//         </ContentCard>
//     );
// };