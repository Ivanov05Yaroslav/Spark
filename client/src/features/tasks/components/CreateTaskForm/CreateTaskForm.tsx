import React from 'react';
import { TwoColumnContentLayout } from '@/components/layout/TwoColumnContentLayout/TwoColumnContentLayout.tsx';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { Input } from '@/components/ui/Input/Input.tsx';
import { TextAreaField } from '@/components/ui/TextAreaField/TextAreaField.tsx';

import { useCreateTaskForm } from '../../hooks/useCreateTaskForm';
import { TaskSidebarSettings } from '../TaskSidebarSettings/TaskSidebarSettings';
import { TaskAttachmentsSection } from '../TaskAttachmentsSection/TaskAttachmentsSection';

interface CreateTaskFormProps {
    onBack: () => void;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onBack }) => {
    const { formState, filesState, linksState, isFormValid, handleSubmit } = useCreateTaskForm();

    return (
        <TwoColumnContentLayout
            title="Створити завдання"
            onBack={onBack}
            sidebarContent={<TaskSidebarSettings formState={formState} />}
            showHeaderButton={true}
            headerButtonText="Створити"
            onHeaderButtonClick={handleSubmit}
            isHeaderButtonDisabled={!isFormValid}
        >
            <ContentCard>
                <Input
                    label="Назва завдання"
                    value={formState.title}
                    onChange={(e) => formState.setTitle(e.target.value)}
                    placeholder="Введіть назву завдання"
                />

                <TextAreaField
                    label="Інструкції"
                    value={formState.instructions}
                    onChange={(e) => formState.setInstructions(e.target.value)}
                    placeholder="Введиіть інструкції (необов'язково)"
                    rows={4}
                />
            </ContentCard>

            <TaskAttachmentsSection
                filesState={filesState}
                linksState={linksState}
            />

        </TwoColumnContentLayout>
    );
};