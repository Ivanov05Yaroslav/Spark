import React from 'react';
import { Input } from '@/components/ui/Input/Input.tsx';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox/CustomCheckbox.tsx';
import { CreatableSelect } from '@/components/ui/CreatableSelect/CreatableSelect.tsx';
import { SelectField } from '@/components/ui/SelectField/SelectField.tsx';

interface LinkUploadFormProps {
  values: {
    title: string;
    module: string;
    linkUrl: string;
    isHidden: boolean;
  };
  handlers: {
    handleChange: (field: 'title' | 'module' | 'linkUrl' | 'isHidden', value: any) => void;
  };
  data: {
    modulesOptions: Array<{ value: string; label: string }>;
    courseInfo: { subjectName: string; className: string };
  };
  isSubmitting: boolean;
  isLoading?: boolean;
}

export const LinkUploadForm = ({
  values,
  handlers,
  data,
  isSubmitting,
  isLoading,
}: LinkUploadFormProps) => {
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
        placeholder={isLoading ? 'Завантаження...' : 'Оберіть тему'}
        disabled={isSubmitting || isLoading}
      />

      <Input
        label="Назва посилання"
        placeholder="Введіть назву посилання"
        value={values.title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handlers.handleChange('title', e.target.value)
        }
        disabled={isSubmitting}
      />

      <Input
        label="Посилання"
        placeholder="Введіть посилання (наприклад, https://...)"
        value={values.linkUrl}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handlers.handleChange('linkUrl', e.target.value)
        }
        disabled={isSubmitting}
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
