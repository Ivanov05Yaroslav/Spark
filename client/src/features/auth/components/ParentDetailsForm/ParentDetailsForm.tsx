import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input/Input.tsx';
import { FullNameInput } from '@/components/auth/FullNameInput/FullNameInput.tsx';
import { Links } from '@/components/auth/Links/Links.tsx';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout.tsx';
import { useParentDetails } from '@/features/auth/hooks/useParentDetails';

export const ParentDetailsForm = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('sessionId') || '';

    const {
        firstName, setFirstName,
        middleName, setMiddleName,
        lastName, setLastName,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        handleSubmit,
        isLoading
    } = useParentDetails(sessionId);

    return (
        <FormLayout
            title="РЕЄСТРАЦІЯ БАТЬКІВ"
            error={null}
            isLoading={isLoading}
            submitButtonText="ДАЛІ"
            loadingButtonText="РЕЄСТРАЦІЯ..."
            onSubmit={handleSubmit}
            showSocial={false}
            links={
                <Links
                    leftText="Вже маєте акаунт?"
                    leftLinkText="Увійти"
                    onLeftLinkClick={() => navigate('/login')}
                />
            }
        >
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