import React from 'react';
import { useParams } from 'react-router-dom';
import { TwoColumnContentLayout } from '@/components/layout/TwoColumnContentLayout/TwoColumnContentLayout.tsx';
import { TestQuestionsList } from '@/features/tests/components/TestQuestionsList/TestQuestionsList.tsx';
import { TestSettingsSidebar } from '@/features/tests/components/TestSettingsSidebar/TestSettingsSidebar.tsx';
import { useEditTestForm } from '@/features/tests/hooks/useEditTestForm';

interface EditTestFormProps {
  onBack: () => void;
}

export const EditTestForm: React.FC<EditTestFormProps> = ({ onBack }) => {
  const { id: courseId, testId } = useParams<{ id: string; testId: string }>();

  const { isLoading, isSubmitting, isValid, onSubmitForm, sidebarProps, questionsProps } =
    useEditTestForm(testId, courseId);

  const handleUpdateTest = () => {
    onSubmitForm();
  };

  if (isLoading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}
      >
        <span>Завантаження даних тесту...</span>
      </div>
    );
  }

  return (
    <div>
      <TwoColumnContentLayout
        title="Редагувати тест"
        onBack={onBack}
        sidebarContent={<TestSettingsSidebar {...sidebarProps} />}
        showHeaderButton={true}
        headerButtonText={isSubmitting ? 'Збереження...' : 'Зберегти зміни'}
        onHeaderButtonClick={handleUpdateTest}
        isHeaderButtonDisabled={isSubmitting || !isValid}
      >
        <TestQuestionsList {...questionsProps} />
      </TwoColumnContentLayout>
    </div>
  );
};
