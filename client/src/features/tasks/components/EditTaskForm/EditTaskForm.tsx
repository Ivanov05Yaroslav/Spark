import React from 'react';
import { TwoColumnContentLayout } from '@/components/layout/TwoColumnContentLayout/TwoColumnContentLayout.tsx';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { Input } from '@/components/ui/Input/Input.tsx';
import { TextAreaField } from '@/components/ui/TextAreaField/TextAreaField.tsx';

import { useEditTaskForm } from '../../hooks/useEditTaskForm';
import { TaskSidebarSettings } from '../TaskSidebarSettings/TaskSidebarSettings';
import { TaskAttachmentsSection } from '../TaskAttachmentsSection/TaskAttachmentsSection';

interface EditTaskFormProps {
  onBack: () => void;
}

export const EditTaskForm: React.FC<EditTaskFormProps> = ({ onBack }) => {
  const {
    formState,
    filesState,
    linksState,
    options,
    isLoading,
    isTaskLoading,
    isSubmitting,
    isFormValid,
    handleSubmit,
  } = useEditTaskForm();

  if (isTaskLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>Завантаження даних завдання...</div>
    );
  }

  return (
    <TwoColumnContentLayout
      title="Редагувати завдання"
      onBack={onBack}
      sidebarContent={
        <TaskSidebarSettings
          formState={{
            dueDate: formState.dueDate,
            setDueDate: formState.setDueDate,
            module: formState.module,
            setModule: formState.setModule,
            nusGroup: formState.nusGroup,
            setNusGroup: formState.setNusGroup,
            hideTask: formState.hideTask,
            setHideTask: formState.setHideTask,
          }}
          options={{
            class: options.classes?.[0] || null,
            subject: options.subject,
            modules: options.modules,
            gradingGroups: options.gradingGroups,
          }}
          isLoading={isLoading}
        />
      }
      showHeaderButton={true}
      headerButtonText={isSubmitting ? 'Збереження...' : 'Зберегти'}
      onHeaderButtonClick={handleSubmit}
      isHeaderButtonDisabled={!isFormValid || isSubmitting}
    >
      <ContentCard>
        <Input
          label="Назва завдання"
          value={formState.title}
          onChange={(e) => formState.setTitle(e.target.value)}
          placeholder="Введіть назву завдання"
          disabled={isSubmitting}
        />

        <TextAreaField
          label="Інструкції"
          value={formState.instructions}
          onChange={(e) => formState.setInstructions(e.target.value)}
          placeholder="Введіть інструкції (необов'язково)"
          rows={4}
          disabled={isSubmitting}
        />
      </ContentCard>

      <TaskAttachmentsSection filesState={filesState} linksState={linksState} />
    </TwoColumnContentLayout>
  );
};
