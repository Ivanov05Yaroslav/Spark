import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/libs/configs/Toast.ts';
import { authService } from '@/api/auth.service.ts';

export const useSchoolDetails = (sessionId: string) => {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const mutation = useMutation({
        mutationFn: () => authService.registerSchoolDetails({
            sessionId,
            email,
            password,
            firstName,
            lastName,
            middleName
        }),
        onSuccess: (data) => {
            toast.success('Профіль створено! Підтвердіть вашу пошту');
            setTimeout(() => {
                const nextSessionId = data.sessionId || sessionId;
                navigate(`/school/verify-email?email=${encodeURIComponent(email)}&sessionId=${nextSessionId}`);
            }, 1000);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Помилка при реєстрації');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!sessionId) {
            toast.error('Помилка: не знайдено сесію реєстрації. Будь ласка, почніть спочатку.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Паролі не збігаються');
            return;
        }

        mutation.mutate();
    };

    return {
        firstName, setFirstName,
        middleName, setMiddleName,
        lastName, setLastName,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        handleSubmit,
        isLoading: mutation.isPending
    };
};