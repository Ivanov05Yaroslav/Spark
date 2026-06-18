import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/libs/configs/Toast.ts';
import { authService } from "@/api/auth.service.ts";

export const useParentCode = () => {
    const navigate = useNavigate();
    const [codes, setCodes] = useState<string[]>(['']);

    const mutation = useMutation({
        mutationFn: (validCodes: string[]) => authService.registerParentInit({ childrenCodes: validCodes }),
        onSuccess: (response) => {
            toast.success(response.message);
            setTimeout(() => {
                navigate(`/parent/register/details?sessionId=${encodeURIComponent(response.sessionId)}`);
            }, 1000);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Щось пішло не так');
        }
    });

    const handleCodeChange = (index: number, val: string) => {
        const sanitized = val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
        const newCodes = [...codes];
        newCodes[index] = sanitized;
        setCodes(newCodes);
    };

    const handleAddChild = () => {
        if (codes.length < 10) setCodes([...codes, '']);
    };

    const handleRemoveChild = (index: number) => {
        setCodes(codes.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validCodes = codes.filter(code => code.length === 6);
        if (validCodes.length > 0) {
            mutation.mutate(validCodes);
        }
    };

    return {
        codes,
        handleCodeChange,
        handleAddChild,
        handleRemoveChild,
        handleSubmit,
        isLoading: mutation.isPending,
        isSubmitDisabled: !codes.some(code => code.length === 6) || mutation.isPending
    };
};