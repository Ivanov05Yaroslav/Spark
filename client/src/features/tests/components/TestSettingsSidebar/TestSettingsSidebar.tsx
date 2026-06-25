import React from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { SelectField } from '@/components/ui/SelectField/SelectField.tsx';
import { Input } from '@/components/ui/Input/Input.tsx';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox/CustomCheckbox.tsx';
import { DurationInput } from '@/components/tests/DurationInput/DurationInput.tsx';
import { DatePickerField } from '@/components/ui/DatePickerField/DatePickerField.tsx';
import { CreatableSelect } from '@/components/ui/CreatableSelect/CreatableSelect.tsx';
import { ModuleDto } from '@/types/modules.types';
import { NushGradingGroupDto } from '@/types/subjects.types';
import styles from './TestSettingsSidebar.module.css';

interface TestSettingsSidebarProps {
  modules: ModuleDto[];
  nusGroups: NushGradingGroupDto[];
  isLoading: boolean;
  subjectName?: string;
  courseClassName?: string;
  title: string;
  setTitle: (v: string) => void;
  moduleId: string;
  setModuleId: (v: string) => void;
  nusGroupId: string;
  setNusGroupId: (v: string) => void;
  deadline: string;
  setDeadline: (v: string) => void;
  hours: string;
  setHours: (v: string) => void;
  minutes: string;
  setMinutes: (v: string) => void;
  attempts: string;
  setAttempts: (v: string) => void;
  isHidden: boolean;
  setIsHidden: (v: boolean) => void;
  isResultHidden: boolean;
  setIsResultHidden: (v: boolean) => void;
  isAttemptHidden: boolean;
  setIsAttemptHidden: (v: boolean) => void;
  isShowCorrectAnswers: boolean;
  setIsShowCorrectAnswers: (v: boolean) => void;
  isShuffleQuestions: boolean;
  setIsShuffleQuestions: (v: boolean) => void;
  isShuffleAnswers: boolean;
  setIsShuffleAnswers: (v: boolean) => void;
}

export const TestSettingsSidebar: React.FC<TestSettingsSidebarProps> = ({
  modules,
  nusGroups,
  isLoading,
  subjectName,
  courseClassName,
  title,
  setTitle,
  moduleId: module,
  setModuleId: setModule,
  nusGroupId: nusGroup,
  setNusGroupId,
  deadline,
  setDeadline,
  hours,
  setHours,
  minutes,
  setMinutes,
  attempts,
  setAttempts,
  isHidden,
  setIsHidden,
  isResultHidden,
  setIsResultHidden,
  isAttemptHidden,
  setIsAttemptHidden,
  isShowCorrectAnswers,
  setIsShowCorrectAnswers,
  isShuffleQuestions,
  setIsShuffleQuestions,
  isShuffleAnswers,
  setIsShuffleAnswers,
}) => {
  const moduleOptions = modules.map((m) => ({ value: String(m.id), label: m.title }));
  const nusGroupOptions = nusGroups.map((g) => ({ value: String(g.id), label: g.name }));

  return (
    <div className={styles.sidebarWrapper}>
      <ContentCard title="Налаштування" className={styles.cardCustom}>
        <div className={styles.formContainer}>
          <SelectField
            label="Клас"
            options={courseClassName ? [{ value: courseClassName, label: courseClassName }] : []}
            value={courseClassName || ''}
            onChange={() => {}}
            disabled={true}
            placeholder={isLoading ? 'Завантаження...' : 'Немає даних'}
          />

          <SelectField
            label="Предмет"
            options={subjectName ? [{ value: subjectName, label: subjectName }] : []}
            value={subjectName || ''}
            onChange={() => {}}
            disabled={true}
            placeholder={isLoading ? 'Завантаження...' : 'Немає даних'}
          />

          <Input
            label="Назва тесту"
            placeholder="Введіть назву тесту"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <CreatableSelect
            options={moduleOptions}
            value={module}
            onChange={(value: string) => setModule(value)}
            label="Тема"
            placeholder={isLoading ? 'Завантаження...' : 'Оберіть тему'}
            disabled={isLoading}
          />

          <SelectField
            label="Група оцінювання НУШ"
            options={nusGroupOptions}
            value={nusGroup}
            onChange={(value: string) => setNusGroupId(value)}
            placeholder={isLoading ? 'Завантаження...' : 'Оберіть тему'}
            disabled={isLoading}
          />

          <DatePickerField
            label="Виконати до"
            value={deadline}
            onChange={(value) => setDeadline(value || '')}
            placeholder="Оберіть дату та час"
          />

          <DurationInput
            label="Тривалість"
            hours={hours}
            minutes={minutes}
            onHoursChange={setHours}
            onMinutesChange={setMinutes}
          />

          <Input
            label="Кількість спроб"
            type="number"
            min="1"
            value={attempts}
            onChange={(e) => setAttempts(e.target.value)}
          />

          <div className={styles.checkboxesGroup}>
            <CustomCheckbox
              label="Приховати тест"
              checked={isHidden}
              onChange={(e) => setIsHidden(e.target.checked)}
            />
            <CustomCheckbox
              label="Приховати результати після здачі"
              checked={isResultHidden}
              onChange={(e) => setIsResultHidden(e.target.checked)}
            />
            <CustomCheckbox
              label="Приховати спробу"
              checked={isAttemptHidden}
              onChange={(e) => setIsAttemptHidden(e.target.checked)}
            />
            <CustomCheckbox
              label="Показувати правильні відповіді"
              checked={isShowCorrectAnswers}
              onChange={(e) => setIsShowCorrectAnswers(e.target.checked)}
            />
            <CustomCheckbox
              label="Перемішати запитання"
              checked={isShuffleQuestions}
              onChange={(e) => setIsShuffleQuestions(e.target.checked)}
            />
            <CustomCheckbox
              label="Перемішати відповіді"
              checked={isShuffleAnswers}
              onChange={(e) => setIsShuffleAnswers(e.target.checked)}
            />
          </div>
        </div>
      </ContentCard>
    </div>
  );
};
