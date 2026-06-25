import React from 'react';
import { useParams } from 'react-router-dom';
import { TwoColumnContentLayout } from '@/components/layout/TwoColumnContentLayout/TwoColumnContentLayout.tsx';
import { TestQuestionsList } from '@/features/tests/components/TestQuestionsList/TestQuestionsList.tsx';
import { TestSettingsSidebar } from '@/features/tests/components/TestSettingsSidebar/TestSettingsSidebar.tsx';
import { useCreateTestForm } from '@/features/tests/hooks/useCreateTestForm';

interface TestBuilderProps {
    onBack: () => void;
}

export const CreateTestForm: React.FC<TestBuilderProps> = ({ onBack }) => {
    const { id: courseId } = useParams<{ id: string }>();

    const { isSubmitting, onSubmitForm, sidebarProps, questionsProps } = useCreateTestForm(courseId);

    const handleSaveTest = () => {
        onSubmitForm();
    };

    return (
        <TwoColumnContentLayout
            title="Створити тест"
            onBack={onBack}
            sidebarContent={<TestSettingsSidebar {...sidebarProps} />}
            showHeaderButton={true}
            headerButtonText={isSubmitting ? "Збереження..." : "Зберегти"}
            onHeaderButtonClick={handleSaveTest}
            isHeaderButtonDisabled={isSubmitting}
        >
            <TestQuestionsList {...questionsProps} />
        </TwoColumnContentLayout>
    );
};