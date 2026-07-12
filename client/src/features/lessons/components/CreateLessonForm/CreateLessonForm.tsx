import React from 'react';
import { TwoColumnContentLayout } from '@/components/layout/TwoColumnContentLayout/TwoColumnContentLayout.tsx';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { Input } from '@/components/ui/Input/Input.tsx';
import { TextAreaField } from '@/components/ui/TextAreaField/TextAreaField.tsx';
import { LessonSidebarSettings } from '@/features/lessons/components/LessonSidebarSettings/LessonSidebarSettings.tsx';
import { useCreateLessonForm } from '@/features/lessons/hooks/useCreateLessonForm.ts';

interface CreateTaskFormProps {
  onBack: () => void;
}

export const CreateLessonForm: React.FC<CreateTaskFormProps> = ({ onBack }) => {
  const { formState, options, isLoading, isSubmitting, isFormValid, handleSubmit } =
    useCreateLessonForm();

  return (
    <TwoColumnContentLayout
      title="Створити урок"
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
      headerButtonText={isSubmitting ? 'Створення...' : 'Створити'}
      onHeaderButtonClick={handleSubmit}
      isHeaderButtonDisabled={!isFormValid || isSubmitting}
    >
      <ContentCard>
        <Input
          label="Тема уроку"
          value={formState.title}
          onChange={(e) => formState.setTitle(e.target.value)}
          placeholder="Введіть тему уроку"
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
