import { useState, useEffect, FormEvent } from 'react';
import { administrationService } from '@/api/administration.service';
import { classesService } from '@/api/classes.service';
import { subjectsService } from '@/api/subjects.service';
import { useStore } from '@/stores/useStore';
import { toast } from '@/libs/configs/Toast';

export const useManualUserCreation = () => {
    const store = useStore();
    const schoolId = store.user?.schoolId;

    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');

    const [classId, setClassId] = useState('');
    const [subjectIds, setSubjectIds] = useState<string[]>([]);

    const [classOptions, setClassOptions] = useState<{ value: string; label: string }[]>([]);
    const [subjectOptions, setSubjectOptions] = useState<{ value: string; label: string }[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingOptions, setIsFetchingOptions] = useState(false);

    useEffect(() => {
        const fetchOptions = async () => {
            setIsFetchingOptions(true);
            try {
                const [classes, subjects] = await Promise.all([
                    classesService.getClasses(),
                    subjectsService.getSubjects()
                ]);

                setClassOptions(classes.map(c => ({ value: c.id, label: c.name })));
                setSubjectOptions(subjects.map(s => ({ value: s.id, label: s.name })));
            } catch (error: any) {
                const serverErrorMessage = error?.response?.data?.message || 'Не вдалося завантажити класи та предмети';
                toast.error(serverErrorMessage);
            } finally {
                setIsFetchingOptions(false);
            }
        };

        fetchOptions();
    }, []);

    const handleRoleChange = (newRole: string) => {
        setRole(newRole);
        if (newRole !== 'STUDENT') setClassId('');
        if (newRole !== 'TEACHER') setSubjectIds([]);
    };

    const isSubmitDisabled = !firstName || !lastName || !email || !role || isLoading;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!schoolId) {
            toast.error('Помилка: School ID не знайдено');
            return;
        }

        setIsLoading(true);

        const className = classOptions.find(c => c.value === classId)?.label;

        const subjects = subjectIds
            .map(id => subjectOptions.find(s => s.value === id)?.label)
            .filter((name): name is string => !!name);

        const payload = {
            schoolId,
            firstName,
            lastName,
            middleName: middleName.trim() ? middleName : undefined,
            email,
            roles: [role],
            ...(role === 'STUDENT' && className ? { className } : {}),
            ...(role === 'TEACHER' && subjects.length > 0 ? { subjects } : {})
        };

        try {
            const data = await administrationService.createManualUser(payload);

            toast.success(data?.message || 'Користувача успішно створено!');

            setFirstName('');
            setLastName('');
            setMiddleName('');
            setEmail('');
            setRole('');
            setClassId('');
            setSubjectIds([]);
        } catch (error: any) {
            const serverErrorMessage = error?.response?.data?.message || 'Не вдалося створити користувача';
            toast.error(serverErrorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formState: {
            firstName, setFirstName,
            middleName, setMiddleName,
            lastName, setLastName,
            email, setEmail,
            role, handleRoleChange,
            classId, setClassId,
            subjectIds, setSubjectIds
        },
        options: {
            classOptions,
            subjectOptions
        },
        uiState: {
            isLoading,
            isFetchingOptions,
            isSubmitDisabled
        },
        handleSubmit
    };
};