import React from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { MultiSelectField } from "@/components/ui/MultiSelectField/MultiSelectField.tsx";
import { DatePickerField } from '@/components/ui/DatePickerField/DatePickerField.tsx';
import { CreatableSelect } from '@/components/ui/CreatableSelect/CreatableSelect.tsx';
import { SelectField } from '@/components/ui/SelectField/SelectField.tsx';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox/CustomCheckbox.tsx';
import { MODULE_OPTIONS, LEVEL_OPTIONS } from '@/libs/constants/tasks.constants';

import styles from './TaskSidebarSettings.module.css';

interface TaskSidebarSettingsProps {
    formState: {
        classes: string[];
        setClasses: (value: string[]) => void;
        dueDate: string;
        setDueDate: (value: string) => void;
        module: string;
        setModule: (value: string) => void;
        gradingGroup: string;
        setGradingGroup: (value: string) => void;
        hideTask: boolean;
        setHideTask: (value: boolean) => void;
    };
}

export const TaskSidebarSettings: React.FC<TaskSidebarSettingsProps> = ({ formState }) => {
    return (
        <ContentCard>
            <MultiSelectField
                label="Клас"
                options={LEVEL_OPTIONS}
                value={formState.classes}
                onChange={formState.setClasses}
                placeholder="Оберіть клас"
            />

            <DatePickerField
                label="Виконати до"
                value={formState.dueDate}
                onChange={formState.setDueDate}
                placeholder="Оберіть дату та час"
            />

            <CreatableSelect
                options={MODULE_OPTIONS}
                value={formState.module}
                onChange={formState.setModule}
                label="Тема"
                placeholder="Оберіть тему"
            />

            <SelectField
                label="Група оцінювання"
                options={LEVEL_OPTIONS}
                value={formState.gradingGroup}
                onChange={formState.setGradingGroup}
                placeholder="Оберіть групу оцінювання"
            />

            <div className={styles.checkboxGroup}>
                <CustomCheckbox
                    label="Приховати завдання"
                    checked={formState.hideTask}
                    onChange={(e) => formState.setHideTask(e.target.checked)}
                />
            </div>
        </ContentCard>
    );
};