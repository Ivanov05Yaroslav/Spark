import React, { useState } from 'react';
import { CourseBanner } from '@/features/courses/components/CourseBanner/CourseBanner';
import { Tabs, TabItem } from '@/components/ui/Tabs/Tabs';
import { CourseCreateButton } from '@/features/courses/components/CourseCreateButton/CourseCreateButton';
import { ModuleList, ModuleData } from '@/features/courses/components/ModuleList/ModuleList';
import { OnlineLessonsBlock, OnlineLessonLink } from '@/features/courses/components/OnlineLessonsBlock/OnlineLessonsBlock';

import ZoomIcon from '@/assets/link.svg?react';

import styles from './CoursePage.module.css';

export const CoursePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('materials');

    const TABS: TabItem[] = [
        { id: 'materials', label: 'Матеріали' },
        { id: 'tasks', label: 'Завдання', badge: 1 },
        { id: 'participants', label: 'Учасники' }
    ];

    const MOCK_MODULES: ModuleData[] = [
        {
            id: 'mod-1',
            title: 'Module 1',
            items: [
                { id: 'm1-1', type: 'LINK', title: 'Link 1' },
                { id: 'm1-2', type: 'THEORY', title: 'Pdf file 1' },
                { id: 'm1-3', type: 'TASK', title: 'Task name 1', subtitle: 'Due: March 25, 2026 at 23:59' }
            ]
        },
        {
            id: 'mod-2',
            title: 'Module 2',
            items: [
                { id: 'm2-1', type: 'LINK', title: 'Link 2' },
                { id: 'm2-2', type: 'THEORY', title: 'Pdf file 3' },
                { id: 'm2-3', type: 'TASK', title: 'Task name 3', subtitle: 'Due: March 25, 2026 at 23:59' },
                { id: 'm2-4', type: 'TASK', title: 'Task name 2', subtitle: 'Due: March 25, 23:59' }
            ]
        }
    ];

    const MOCK_LINKS: OnlineLessonLink[] = [
        {
            id: 'link-1',
            title: 'Zoom',
            url: 'https://zoom.us',
            icon: ZoomIcon
        }
    ];

    const handleCreateModule = () => console.log('Створити модуль');
    const handleCreateTheory = () => console.log('Створити теорію');
    const handleCreateTask = () => console.log('Створити завдання');
    const handleCreateTest = () => console.log('Створити тест');

    return (
        <div className={styles.pageContainer}>
            <CourseBanner
                title="Algebra"
                description="Algebra covers the basics of equations, functions, and graphing. You’ll learn to solve linear and quadratic equations, understand inequalities, and work with polynomials. This foundational course builds critical problem-solving skills for advanced math and real-world applications."
                teacherName="Daria Zhukova"
                themeColor="#702DFF"
                onEdit={() => console.log('Редагувати курс')}
            />

            <div className={styles.contentLayout}>
                <div className={styles.mainColumn}>
                    <div className={styles.tabsRow}>
                        <Tabs
                            items={TABS}
                            activeId={activeTab}
                            onTabChange={setActiveTab}
                        />
                        <CourseCreateButton
                            themeColor="#702DFF"
                            onCreateModule={handleCreateModule}
                            onCreateTheory={handleCreateTheory}
                            onCreateTask={handleCreateTask}
                            onCreateTest={handleCreateTest}
                        />
                    </div>

                    <div className={styles.tabContent}>
                        {activeTab === 'materials' && (
                            <ModuleList
                                modules={MOCK_MODULES}
                                onItemClick={(item) => console.log('Клік по:', item.title)}
                            />
                        )}
                        {activeTab === 'tasks' && (
                            <div>Тут буде список усіх завдань...</div>
                        )}
                        {activeTab === 'participants' && (
                            <div>Тут буде список учасників курсу...</div>
                        )}
                    </div>
                </div>

                <div className={styles.sidebarColumn}>
                    <OnlineLessonsBlock
                        links={MOCK_LINKS}
                        onAdd={() => console.log('Додати лінк')}
                        onEditLink={(id) => console.log('Редагувати лінк', id)}
                        onDeleteLink={(id) => console.log('Видалити лінк', id)}
                    />
                </div>
            </div>
        </div>
    );
};