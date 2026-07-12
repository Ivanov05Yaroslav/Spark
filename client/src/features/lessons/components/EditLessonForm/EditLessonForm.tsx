import React from 'react';
import { TwoColumnContentLayout } from '@/components/layout/TwoColumnContentLayout/TwoColumnContentLayout.tsx';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { Input } from '@/components/ui/Input/Input.tsx';
import { TextAreaField } from '@/components/ui/TextAreaField/TextAreaField.tsx';
import { LessonSidebarSettings } from '@/features/lessons/components/LessonSidebarSettings/LessonSidebarSettings.tsx';
import { useEditLessonForm } from '@/features/lessons/hooks/useEditLessonForm.ts';

interface EditTaskFormProps {
  onBack: () => void;
}

export const EditLessonForm: React.FC<EditTaskFormProps> = ({ onBack }) => {
  const {
    formState,
    options,
    isLoading,
    isLessonLoading,
    isSubmitting,
    isFormValid,
    handleSubmit,
  } = useEditLessonForm();

  if (isLessonLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>Завантаження даних завдання...</div>
    );
  }

  return (
    <TwoColumnContentLayout
      title="Редагувати урок"
      onBack={onBack}
      sidebarContent={
        <LessonSidebarSettings
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
          label="Тема уроку"
          value={formState.title}
          onChange={(e) => formState.setTitle(e.target.value)}
          placeholder="Введіть назву завдання"
          disabled={isSubmitting}
        />

        <TextAreaField
          label="Опис теми уроку"
          value={formState.instructions}
          onChange={(e) => formState.setInstructions(e.target.value)}
          placeholder="Введіть опис теми (необов'язково)"
          rows={4}
          disabled={isSubmitting}
        />
      </ContentCard>
    </TwoColumnContentLayout>
  );
};
