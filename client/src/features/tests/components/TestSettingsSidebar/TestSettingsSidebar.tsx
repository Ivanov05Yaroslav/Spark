import React from 'react';
import { useParams } from 'react-router-dom';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { SelectField } from '@/components/ui/SelectField/SelectField.tsx';
import { Input } from '@/components/ui/Input/Input.tsx';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox/CustomCheckbox.tsx';
import { DurationInput } from '@/components/tests/DurationInput/DurationInput.tsx';
import styles from './TestSettingsSidebar.module.css';
import { DatePickerField } from "@/components/ui/DatePickerField/DatePickerField.tsx";
import { CreatableSelect } from "@/components/ui/CreatableSelect/CreatableSelect.tsx";

import { useTestSettingsSidebarData } from '@/features/tests/hooks/useTestSettingsSidebarData';

export const TestSettingsSidebar: React.FC = () => {
    const { id: courseId } = useParams<{ id: string }>();

    const {
        modules,
        nusGroups,
        isLoading,
        subjectName,
        courseClassName,

        title, setTitle,
        moduleId: module, setModuleId: setModule,
        nusGroupId: nusGroup, setNusGroupId,
        deadline, setDeadline,
        hours, setHours,
        minutes, setMinutes,
        attempts, setAttempts,
        isHidden, setIsHidden,
        isResultHidden, setIsResultHidden
    } = useTestSettingsSidebarData(courseId);

    const moduleOptions = modules.map(m => ({ value: String(m.id), label: m.title }));
    const nusGroupOptions = nusGroups.map(g => ({ value: String(g.id), label: g.name }));

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
                        placeholder={isLoading ? "Завантаження..." : "Немає даних"}
                    />

                    <SelectField
                        label="Предмет"
                        options={subjectName ? [{ value: subjectName, label: subjectName }] : []}
                        value={subjectName || ''}
                        onChange={() => {}}
                        disabled={true}
                        placeholder={isLoading ? "Завантаження..." : "Немає даних"}
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
                        placeholder={isLoading ? "Завантаження..." : "Оберіть тему"}
                        disabled={isLoading}
                    />

                    <SelectField
                        label="Група оцінювання НУШ"
                        options={nusGroupOptions}
                        value={nusGroup}
                        onChange={(value: string) => setNusGroupId(value)}
                        placeholder={isLoading ? "Завантаження..." : "Оберіть тему"}
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
                    </div>

                </div>
            </ContentCard>
        </div>
    );
};