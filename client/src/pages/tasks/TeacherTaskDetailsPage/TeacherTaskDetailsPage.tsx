import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Tabs } from '@/components/ui/Tabs/Tabs'; // ← Виправили імпорт (прибрали TabItem)
import { TaskInstructionsSection } from '@/features/tasks/components/TaskInstructionsSection/TaskInstructionsSection';
import { StudentSubmissionsList } from '@/features/tasks/components/StudentSubmissionsList/StudentSubmissionsList';
import { SubmissionReviewPanel } from '@/features/tasks/components/SubmissionReviewPanel/SubmissionReviewPanel';
import { useTaskInstructions } from '@/features/tasks/hooks/useTaskInstructions';
import styles from './TeacherTaskDetailsPage.module.css';

const mockSubmissions = [
    { id: '1', studentName: 'Олександр Бондаренко', status: 'Graded' as const, grade: 11, date: 'Вчора, 14:20', attachments: ["https://example.com/file1.pdf"] },
    { id: '2', studentName: 'Марія Ковальчук', status: 'Turned in' as const, grade: null, date: 'Сьогодні, 09:15', attachments: ["https://example.com/homework.docx", "https://figma.com/file"] },
    { id: '3', studentName: 'Іван Шевченко', status: 'Assigned' as const, grade: null, date: '-', attachments: [] },
    { id: '4', studentName: 'Анна Мельник', status: 'Missing' as const, grade: null, date: '-', attachments: [] },
];

const mockComments = [
    {
        id: '1',
        authorName: 'Дмитро Іванов',
        content: 'Я завантажив виправлену версію файлу, перевірте, будь ласка.',
        createdAt: '10 хв. тому',
    }
];

export const TeacherTaskDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const { taskId } = useParams<{ taskId: string }>();

    const { task, isLoading, error } = useTaskInstructions(taskId);

    const [activeTab, setActiveTab] = useState<'instructions' | 'submissions'>('instructions');
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
    const [currentGrade, setCurrentGrade] = useState<string | number>('');

    const selectedSubmission = mockSubmissions.find(sub => sub.id === selectedSubmissionId);

    const handleStudentClick = (id: string) => {
        setSelectedSubmissionId(id);
        const sub = mockSubmissions.find(s => s.id === id);
        setCurrentGrade(sub?.grade !== null && sub?.grade !== undefined ? sub.grade : '');
    };

    const handleReturnGrade = () => {
        console.log('Повернуто оцінку:', currentGrade);
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Graded': return 'Оцінено';
            case 'Turned in': return 'Здано';
            case 'Assigned': return 'Призначено';
            case 'Missing': return 'Протерміновано';
            default: return '';
        }
    };

    const tabItems = [
        { id: 'instructions', label: 'Інструкція' },
        { id: 'submissions', label: 'Роботи студентів' }
    ];

    if (isLoading) return <div className={styles.loading}>Завантаження...</div>;
    if (error) return <div className={styles.error}>Помилка завантаження даних</div>;

    return (
        <div className={styles.pageContainer}>
            <PageHeader
                title={task?.title || 'Завдання'}
            />

            <div className={styles.tabsWrapper}>
                <Tabs
                    items={tabItems}
                    activeId={activeTab}
                    onTabChange={(id) => setActiveTab(id as 'instructions' | 'submissions')}
                />
            </div>

            <main className={styles.mainContent}>
                {activeTab === 'instructions' ? (
                    <TaskInstructionsSection />
                ) : (
                    <div className={styles.submissionsLayout}>
                        <div className={styles.sidebar}>
                            <StudentSubmissionsList
                                submissions={mockSubmissions}
                                selectedId={selectedSubmissionId || undefined}
                                onItemClick={handleStudentClick}
                            />
                        </div>

                        <div className={styles.reviewPanelWrapper}>
                            {selectedSubmission ? (
                                <SubmissionReviewPanel
                                    gradeValue={currentGrade}
                                    onGradeChange={setCurrentGrade}
                                    onReturnClick={handleReturnGrade}
                                    isReturnDisabled={!currentGrade}
                                    studentWork={{
                                        statusText: getStatusLabel(selectedSubmission.status),
                                        submittedAt: selectedSubmission.date !== '-' ? selectedSubmission.date : undefined,
                                        attachments: selectedSubmission.attachments
                                    }}
                                    commentsData={{
                                        comments: mockComments,
                                        onAddComment: (content) => console.log('Новий комент:', content)
                                    }}
                                />
                            ) : (
                                <div className={styles.emptySelection}>
                                    Оберіть студента зі списку зліва
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
};