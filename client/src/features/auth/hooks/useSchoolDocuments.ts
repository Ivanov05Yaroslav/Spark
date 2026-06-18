import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/libs/configs/Toast.ts';
import { authService } from '@/api/auth.service.ts';
import { SubmitSchoolDocsRequestDTO } from '@/types/school.types.ts';

export const useSchoolDocuments = (sessionId: string) => {
    const [passportFiles, setPassportFiles] = useState<File[]>([]);
    const [secondaryDocType, setSecondaryDocType] = useState<string>('');
    const [secondaryFiles, setSecondaryFiles] = useState<File[]>([]);

    const mutation = useMutation({
        mutationFn: (requestData: SubmitSchoolDocsRequestDTO) => authService.submitDocuments(requestData),
        onSuccess: (data) => {
            toast.success(data.message || 'Документи успішно відправлено!');
            setTimeout(() => {
                window.location.href = `/`;
            }, 1000);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Помилка при завантаженні документів');
        }
    });

    const handleDocTypeChange = (newValue: string) => {
        setSecondaryDocType(newValue);
        setSecondaryFiles([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!sessionId) {
            return toast.error('Відсутній ідентифікатор сесії (sessionId)');
        }
        if (passportFiles.length === 0) {
            return toast.error('Будь ласка, завантажте хоча б один скан паспорта');
        }
        if (!secondaryDocType) {
            return toast.error('Будь ласка, оберіть тип додаткового документа');
        }
        if (secondaryFiles.length === 0) {
            return toast.error('Будь ласка, завантажте додатковий документ');
        }

        const requestData = {
            sessionId,
            passportDocs: passportFiles,
            [secondaryDocType]: secondaryFiles
        } as SubmitSchoolDocsRequestDTO;

        mutation.mutate(requestData);
    };

    return {
        passportFiles,
        setPassportFiles,
        secondaryDocType,
        handleDocTypeChange,
        secondaryFiles,
        setSecondaryFiles,
        handleSubmit,
        isLoading: mutation.isPending
    };
};