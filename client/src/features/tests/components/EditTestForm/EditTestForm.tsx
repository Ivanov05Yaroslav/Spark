import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TwoColumnContentLayout } from '@/components/layout/TwoColumnContentLayout/TwoColumnContentLayout.tsx';
import { TestQuestionsList } from '@/features/tests/components/TestQuestionsList/TestQuestionsList.tsx';
import { TestSettingsSidebar } from '@/features/tests/components/TestSettingsSidebar/TestSettingsSidebar.tsx';

interface EditTestFormProps {
    onBack: () => void;
}

export const EditTestForm: React.FC<EditTestFormProps> = ({ onBack }) => {
    const { id: testId } = useParams<{ id: string }>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdateTest = () => {
        setIsSubmitting(true);
        console.log('Оновлюємо тест...', { testId });

        setTimeout(() => {
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div>
            {/*<TwoColumnContentLayout*/}
            {/*    title="Редагувати тест"*/}
            {/*    onBack={onBack}*/}
            {/*    sidebarContent={<TestSettingsSidebar />}*/}
            {/*    showHeaderButton={true}*/}
            {/*    headerButtonText={isSubmitting ? "Збереження..." : "Зберегти зміни"}*/}
            {/*    onHeaderButtonClick={handleUpdateTest}*/}
            {/*    isHeaderButtonDisabled={isSubmitting}*/}
            {/*>*/}
            {/*    <TestQuestionsList />*/}
            {/*</TwoColumnContentLayout>*/}
        </div>

    );
};