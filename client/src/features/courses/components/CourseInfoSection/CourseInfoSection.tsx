import React from 'react';
import { SelectField } from '@/components/ui/SelectField/SelectField.tsx';
import { MultiSelectField } from '@/components/ui/MultiSelectField/MultiSelectField.tsx';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox/CustomCheckbox.tsx';
import { DatePickerField } from '@/components/ui/DatePickerField/DatePickerField.tsx';

export const CourseInfoSection = ({ values, handlers, data = {} }: any) => {
  const subjectOptions = (data?.subjects || []).map((s: any) => ({ value: s.id, label: s.name }));
  const classOptions = (data?.classes || []).map((c: any) => ({ value: c.id, label: c.name }));
  const teacherOptions = (data?.teachers || []).map((t: any) => ({
    value: t.id,
    label: `${t.firstName} ${t.lastName}`,
  }));
  const studentOptions = (data?.students || []).map((s: any) => ({
    value: s.id,
    label: `${s.firstName} ${s.lastName}`,
  }));

  const isDataLoading = data?.isLoading || false;

  return (
    <>
      <SelectField
        label="Предмет"
        placeholder="Оберіть предмет"
        options={subjectOptions}
        value={values.subject}
        onChange={handlers.setSubject}
        disabled={values.isEditMode}
      />

      <SelectField
        label="Клас"
        placeholder="Оберіть клас"
        options={classOptions}
        value={values.grade}
        onChange={handlers.setGrade}
        disabled={isDataLoading || values.isEditMode}
      />

      <div style={{ display: 'flex', gap: '24px', width: '100%' }}>
        <div style={{ flex: 1 }}>
          <DatePickerField
            label="Дата початку курсу"
            value={values.startDate}
            onChange={handlers.setStartDate}
            placeholder="Оберіть дату"
          />
        </div>
        <div style={{ flex: 1 }}>
          <DatePickerField
            label="Дата закінчення курсу"
            value={values.endDate}
            onChange={handlers.setEndDate}
            placeholder="Оберіть дату"
          />
        </div>
      </div>

      <MultiSelectField
        label="Співвикладачі"
        placeholder="Оберіть вчителів"
        options={teacherOptions}
        value={values.coTeachers}
        onChange={handlers.setCoTeachers}
        disabled={isDataLoading || !values.subject}
      />

      <CustomCheckbox
        label="Розділити на групи"
        checked={values.isDivided}
        onChange={(e) => handlers.handleIsDividedChange(e.target.checked)}
      />

      {values.isDivided && (
        <>
          <SelectField
            label="Номер групи"
            placeholder="Оберіть номер групи"
            options={[
              { value: '1', label: 'Група 1' },
              { value: '2', label: 'Група 2' },
            ]}
            value={values.groupName}
            onChange={handlers.setGroupName}
          />

          <MultiSelectField
            label="Студенти"
            placeholder="Оберіть студентів"
            options={studentOptions}
            value={values.students}
            onChange={handlers.setStudents}
            disabled={!values.grade}
          />
        </>
      )}

      <CustomCheckbox
        label="Приховати курс"
        checked={values.isHidden}
        onChange={(e) => handlers.setIsHidden(e.target.checked)}
      />
    </>
  );
};
