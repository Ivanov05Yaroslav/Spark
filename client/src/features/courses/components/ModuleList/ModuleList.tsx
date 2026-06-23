import React from 'react';
import { CourseModule } from '@/components/courses/CourseModule/CourseModule';
import { ModuleItem } from '@/components/courses/ModuleItem/ModuleItem';

import LinkIcon from '@/assets/link.svg?react';
import TheoryIcon from '@/assets/theory.svg?react';
import TaskIcon from '@/assets/task.svg?react';
import TestIcon from '@/assets/test.svg?react';

import styles from './ModuleList.module.css';

export type MaterialType = 'LINK' | 'THEORY' | 'TASK' | 'TEST';

export interface ModuleItemData {
    id: string;
    type: MaterialType;
    title: string;
    subtitle?: string; // Например "Due: March 25"
}

export interface ModuleData {
    id: string;
    title: string;
    items: ModuleItemData[];
}

interface ModuleListProps {
    modules: ModuleData[];
    onItemClick?: (item: ModuleItemData, moduleId: string) => void;
}

const getIconByType = (type: MaterialType) => {
    switch (type) {
        case 'LINK': return LinkIcon;
        case 'THEORY': return TheoryIcon;
        case 'TASK': return TaskIcon;
        case 'TEST': return TestIcon;
        default: return TheoryIcon;
    }
};

export const ModuleList: React.FC<ModuleListProps> = ({ modules, onItemClick }) => {
    if (!modules || modules.length === 0) {
        return (
            <div className={styles.emptyState}>
                На цьому курсі поки що немає жодного модуля.
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {modules.map((module) => (
                <CourseModule key={module.id} title={module.title}>
                    {module.items.length > 0 ? (
                        module.items.map((item) => (
                            <ModuleItem
                                key={item.id}
                                icon={getIconByType(item.type)}
                                title={item.title}
                                subtitle={item.subtitle}
                                onClick={() => onItemClick?.(item, module.id)}
                            />
                        ))
                    ) : (
                        <div className={styles.emptyModule}>
                            У цьому модулі поки немає матеріалів
                        </div>
                    )}
                </CourseModule>
            ))}
        </div>
    );
};