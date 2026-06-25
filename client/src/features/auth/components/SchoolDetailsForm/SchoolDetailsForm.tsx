import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/Input/Input.tsx';
import { FullNameInput } from '@/components/auth/FullNameInput/FullNameInput.tsx';
import { Links } from '@/components/auth/Links/Links.tsx';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout.tsx';
import { useSchoolDetails } from '@/features/auth/hooks/useSchoolDetails';
import styles from './SchoolDetailsForm.module.css';

export const SchoolDetailsForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId') || '';

  const {
    firstName,
    setFirstName,
    middleName,
    setMiddleName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleSubmit,
    isLoading,
  } = useSchoolDetails(sessionId);

  return (
    <FormLayout
      title="ЗАЯВКА НА РЕЄСТРАЦІЮ ШКОЛИ"
      error={null}
      isLoading={isLoading}
      submitButtonText="ДАЛІ"
      loadingButtonText="ЗАВАНТАЖЕННЯ..."
      onSubmit={handleSubmit}
      showSocial={false}
      links={
        <Links
          leftText="Школа вже зареєстрована?"
          leftLinkText="Увійти"
          onLeftLinkClick={() => navigate('/login')}
        />
      }
    >
      <p className={styles.subtitle}>Будь ласка, введіть дані для створення акаунту директора.</p>

      <FullNameInput
        label="ПІБ"
        firstName={firstName}
        onFirstNameChange={setFirstName}
        middleName={middleName}
        onMiddleNameChange={setMiddleName}
        lastName={lastName}
        onLastNameChange={setLastName}
        disabled={isLoading}
      />

      <Input
        label="Email"
        type="email"
        placeholder="Введіть ваш email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isLoading}
      />

      <Input
        label="Пароль"
        type="password"
        placeholder="Введіть ваш пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isLoading}
      />

      <Input
        label="Повторіть пароль"
        type="password"
        placeholder="Повторіть ваш пароль"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        disabled={isLoading}
      />
    </FormLayout>
  );
};
