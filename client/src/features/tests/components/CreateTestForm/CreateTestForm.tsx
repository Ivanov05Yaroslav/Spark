import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TwoColumnContentLayout } from '@/components/layout/TwoColumnContentLayout/TwoColumnContentLayout.tsx';

import { TestQuestionsList } from '@/features/tests/components/TestQuestionsList/TestQuestionsList.tsx';
import { TestSettingsSidebar } from '@/features/tests/components/TestSettingsSidebar/TestSettingsSidebar.tsx';

interface TestBuilderProps {
    onBack: () => void;
}

export const CreateTestForm: React.FC<TestBuilderProps> = ({ onBack }) => {
    const { id: courseId } = useParams<{ id: string }>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSaveTest = () => {
        setIsSubmitting(true);
        console.log('Зберігаємо тест для курсу...', { courseId });

        setTimeout(() => {
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <TwoColumnContentLayout
            title="Створити тест"
            onBack={onBack}
            sidebarContent={<TestSettingsSidebar />}
            showHeaderButton={true}
            headerButtonText={isSubmitting ? "Збереження..." : "Зберегти"}
            onHeaderButtonClick={handleSaveTest}
            isHeaderButtonDisabled={isSubmitting}
        >
            <TestQuestionsList />
        </TwoColumnContentLayout>
    );
};