import React from 'react';
import { Input } from '@/components/ui/Input/Input.tsx';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox/CustomCheckbox.tsx';
import { CreatableSelect } from '@/components/ui/CreatableSelect/CreatableSelect.tsx';
import { SelectField } from '@/components/ui/SelectField/SelectField.tsx';
import { FileUpload } from '@/components/ui/FileUpload/FileUpload.tsx';

interface FileUploadFormProps {
  values: {
    title: string;
    module: string;
    isHidden: boolean;
    file: File | null;
  };
  handlers: {
    handleChange: (field: 'title' | 'module' | 'isHidden', value: any) => void;
    handleFilesChange: (files: File[]) => void;
    handleRemoveExisting: () => void;
  };
  data: {
    modulesOptions: Array<{ value: string; label: string }>;
    courseInfo: { subjectName: string; className: string };
    existingFileUrl: string | null;
  };
  isSubmitting: boolean;
  isLoading?: boolean;
}

export const FileUploadForm = ({
  values,
  handlers,
  data,
  isSubmitting,
  isLoading,
}: FileUploadFormProps) => {
  const subjectOptions = data.courseInfo.subjectName
    ? [{ value: data.courseInfo.subjectName, label: data.courseInfo.subjectName }]
    : [];

  const classOptions = data.courseInfo.className
    ? [{ value: data.courseInfo.className, label: data.courseInfo.className }]
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <SelectField
        label="Предмет"
        value={isLoading ? 'Завантаження...' : data.courseInfo.subjectName}
        options={subjectOptions}
        disabled={true}
      />

      <SelectField
        label="Клас"
        value={isLoading ? 'Завантаження...' : data.courseInfo.className}
        options={classOptions}
        disabled={true}
      />

      <CreatableSelect
        label="Тема"
        options={data.modulesOptions}
        value={values.module}
        onChange={(val: string) => handlers.handleChange('module', val)}
        placeholder={isLoading ? 'Завантаження...' : 'Оберіть тему або введіть нову'}
        disabled={isSubmitting || isLoading}
      />

      <Input
        label="Назва матеріалу"
        placeholder="Введіть назву файлу"
        value={values.title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handlers.handleChange('title', e.target.value)
        }
        disabled={isSubmitting}
      />

      <FileUpload
        onFilesChange={handlers.handleFilesChange}
        values={values.file ? [values.file] : []}
        maxFiles={1}
        existingUrl={data.existingFileUrl}
        onRemoveExisting={handlers.handleRemoveExisting}
      />

      <CustomCheckbox
        label="Приховати від студентів"
        checked={values.isHidden}
        onChange={(e) => handlers.handleChange('isHidden', e.target.checked)}
        disabled={isSubmitting}
      />
    </div>
  );
};
