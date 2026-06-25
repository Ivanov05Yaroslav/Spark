import React from 'react';
import { FullNameInput } from '@/components/auth/FullNameInput/FullNameInput.tsx';
import { Input } from '@/components/ui/Input/Input.tsx';
import { SelectField } from '@/components/ui/SelectField/SelectField.tsx';
import { MultiSelectField } from '@/components/ui/MultiSelectField/MultiSelectField';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton.tsx';
import { ROLE_LABELS } from '@/libs/constants/users.constants.ts';
import { useManualUserCreation } from '@/features/administration/hooks/useManualUserCreation';

const roleOptions = Object.entries(ROLE_LABELS)
  .filter(([key]) => key !== 'SUPER_ADMIN')
  .map(([key, value]) => ({
    value: key,
    label: value,
  }));

export const ManualUserCreation = () => {
  const {
    formState: {
      firstName,
      setFirstName,
      middleName,
      setMiddleName,
      lastName,
      setLastName,
      email,
      setEmail,
      role,
      handleRoleChange,
      classId,
      setClassId,
      subjectIds,
      setSubjectIds,
    },
    options: { classOptions, subjectOptions },
    uiState: { isLoading, isFetchingOptions, isSubmitDisabled },
    handleSubmit,
  } = useManualUserCreation();

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <FullNameInput
        firstName={firstName}
        middleName={middleName}
        lastName={lastName}
        onFirstNameChange={setFirstName}
        onMiddleNameChange={setMiddleName}
        onLastNameChange={setLastName}
      />

      <Input
        label="Електронна пошта"
        placeholder="Введіть email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        disabled={isLoading}
      />

      <SelectField
        label="Ролі"
        placeholder="Оберіть ролі"
        value={role}
        onChange={handleRoleChange}
        options={roleOptions}
        disabled={isLoading}
      />

      {role.includes('STUDENT') && (
        <SelectField
          label="Клас"
          placeholder={isFetchingOptions ? 'Завантаження класів...' : 'Оберіть клас'}
          value={classId}
          onChange={setClassId}
          options={classOptions}
          disabled={isLoading || isFetchingOptions}
        />
      )}

      {role.includes('TEACHER') && (
        <MultiSelectField
          label="Предмети"
          placeholder={isFetchingOptions ? 'Завантаження предметів...' : 'Оберіть предмети'}
          value={subjectIds}
          onChange={setSubjectIds}
          options={subjectOptions}
          disabled={isLoading || isFetchingOptions}
        />
      )}

      <PrimaryButton type="submit" disabled={isSubmitDisabled}>
        {isLoading ? 'СТВОРЕННЯ...' : 'ЗАРЕЄСТРУВАТИ КОРИСТУВАЧА'}
      </PrimaryButton>
    </form>
  );
};
