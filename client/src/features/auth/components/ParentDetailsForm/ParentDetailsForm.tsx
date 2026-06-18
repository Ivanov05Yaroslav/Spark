import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from '@/libs/configs/Toast.ts';
import { Input } from '@/components/ui/Input/Input.tsx';
import { FullNameInput } from '@/components/auth/FullNameInput/FullNameInput.tsx';
import { Links } from '@/components/auth/Links/Links.tsx';
import { registrationService } from '@/api/registration.service.ts';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout.tsx';

export const ParentDetailsForm = () => {
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const sessionId = searchParams.get('sessionId') || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!sessionId) {
            toast.error('Помилка: не знайдено сесію реєстрації. Будь ласка, почніть спочатку.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Паролі не збігаються');
            return;
        }

        setIsLoading(true);

        try {
            const data = await registrationService.registerParentDetails({
                sessionId,
                email,
                password,
                firstName,
                lastName,
                middleName
            });

            toast.success('Профіль створено! Підтвердіть вашу пошту');

            setTimeout(() => {
                const nextSessionId = data.sessionId || sessionId;
                navigate(`/parent/verify-email?email=${encodeURIComponent(email)}&sessionId=${nextSessionId}`);
            }, 1000);
        } catch (err: any) {
            toast.error(err.message || 'Помилка при реєстрації');
        } finally {
            setIsLoading(false);
        }
    };

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