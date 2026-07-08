import React, { useMemo } from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { DatePickerField } from '@/components/ui/DatePickerField/DatePickerField.tsx';
import { CreatableSelect } from '@/components/ui/CreatableSelect/CreatableSelect.tsx';
import { SelectField } from '@/components/ui/SelectField/SelectField.tsx';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox/CustomCheckbox.tsx';

import styles from './TaskSidebarSettings.module.css';

interface SelectOption {
  value: string;
  label: string;
}

interface TaskSidebarSettingsProps {
  formState: {
    dueDate: string;
    setDueDate: (value: string) => void;
    module: string;
    setModule: (value: string) => void;
    nusGroup: string;
    setNusGroup: (value: string) => void;
    hideTask: boolean;
    setHideTask: (value: boolean) => void;
  };
  options: {
    class: SelectOption | null;
    subject: SelectOption | null;
    modules: SelectOption[];
    gradingGroups: SelectOption[];
  };
  isLoading?: boolean;
}

export const TaskSidebarSettings: React.FC<TaskSidebarSettingsProps> = ({
  formState,
  options,
  isLoading,
}) => {
  const isNushClass = useMemo(() => {
    if (!options.class?.label) return false;

    const match = options.class.label.match(/^(\d+)/);
    if (match) {
      const gradeNumber = parseInt(match[1], 10);
      return gradeNumber >= 5 && gradeNumber <= 9;
    }

    return false;
  }, [options.class?.label]);

  return (
    <ContentCard className={styles.sidebarCard}>
      <SelectField
        label="Клас"
        options={options.class ? [options.class] : []}
        value={options.class ? options.class.value : ''}
        onChange={() => {}}
        placeholder={isLoading ? 'Завантаження...' : 'Клас не вказано'}
        disabled={true}
      />

      <SelectField
        label="Предмет"
        options={options.subject ? [options.subject] : []}
        value={options.subject ? options.subject.value : ''}
        onChange={() => {}}
        placeholder={isLoading ? 'Завантаження...' : 'Предмет не вказано'}
        disabled={true}
      />

      <DatePickerField
        label="Виконати до"
        value={formState.dueDate}
        onChange={formState.setDueDate}
        placeholder="Оберіть дату та час"
      />

      <CreatableSelect
        options={options.modules}
        value={formState.module}
        onChange={formState.setModule}
        label="Тема"
        placeholder={isLoading ? 'Завантаження...' : 'Оберіть тему'}
        disabled={isLoading}
      />

      {isNushClass && (
        <SelectField
          label="Група оцінювання НУШ"
          options={options.gradingGroups}
          value={formState.nusGroup}
          onChange={formState.setNusGroup}
          placeholder={isLoading ? 'Завантаження...' : 'Оберіть групу результатів'}
          disabled={isLoading}
        />
      )}

      <div className={styles.checkboxGroup}>
        <CustomCheckbox
          label="Приховати завдання"
          checked={formState.hideTask}
          onChange={(e) => formState.setHideTask(e.target.checked)}
        />
      </div>
    </ContentCard>
  );
};
