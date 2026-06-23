import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCourseData } from '../hooks/useCourseData';
import { courseService } from '@/api/courses.service';
import { formatToStrictISO } from '@/libs/utils/date';
import { toast } from '@/libs/configs/Toast';

export const useCreateCourse = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [subject, setSubject] = useState('');
    const [grade, setGrade] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [coTeachers, setCoTeachers] = useState<string[]>([]);

    const [isDivided, setIsDivided] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [students, setStudents] = useState<string[]>([]);

    const [themeColor, setThemeColor] = useState('purple');
    const [backgroundFiles, setBackgroundFiles] = useState<File[]>([]);
    const [isHidden, setIsHidden] = useState(false);

    const { subjectsQuery, classesQuery, teachersQuery, studentsQuery } = useCourseData(subject, grade);

    const handleIsDividedChange = (checked: boolean) => {
        setIsDivided(checked);
        if (!checked) {
            setGroupName('');
            setStudents([]);
        }
    };

    const createCourseMutation = useMutation({
        mutationFn: (formData: FormData) => courseService.createCourse(formData),
        onSuccess: (data: any) => {
            toast.success(data?.message || 'Курс успішно створено!');
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            setTimeout(() => {
                navigate('/courses');
            }, 1500);
        },
        onError: (err: any) => {
            const serverErrorMessage = err?.response?.data?.message || err?.message || 'Помилка при створенні курсу';
            toast.error(serverErrorMessage);
        }
    });

    const handleCreate = () => {
        const formData = new FormData();

        formData.append('subjectId', subject);
        formData.append('classId', grade);
        formData.append('startDate', formatToStrictISO(startDate));
        formData.append('endDate', formatToStrictISO(endDate));
        formData.append('themeColor', themeColor);
        formData.append('isHidden', String(isHidden));

        if (coTeachers.length > 0) {
            formData.append('coTeacherIds', coTeachers.join(','));
        }

        if (isDivided) {
            let finalGroupName = groupName.trim();

            if (!finalGroupName) {
                finalGroupName = 'Група 1';
            }
            else if (!finalGroupName.toLowerCase().includes('груп')) {
                finalGroupName = `Група ${finalGroupName}`;
            }

            formData.append('groupName', finalGroupName);

            if (students.length > 0) {
                formData.append('studentIds', students.join(','));
            }
        }

        if (backgroundFiles.length > 0) {
            formData.append('backgroundImage', backgroundFiles[0]);
        }

        createCourseMutation.mutate(formData);
    };

    const isBaseValid = !!(subject && grade && startDate && endDate);
    const isGroupValid = isDivided ? !!(groupName && students.length > 0) : true;
    const isFormValid = isBaseValid && isGroupValid;

    return {
        values: {
            subject, grade, startDate, endDate, coTeachers,
            isDivided, groupName, students, themeColor, backgroundFiles,
            isHidden
        },
        handlers: {
            setSubject, setGrade, setStartDate, setEndDate, setCoTeachers,
            setIsDivided, setGroupName, setStudents,
            handleIsDividedChange, handleCreate,
            setThemeColor, setBackgroundFiles,
            setIsHidden
        },
        data: {
            subjects: subjectsQuery.data || [],
            classes: classesQuery.data || [],
            teachers: teachersQuery.data || [],
            students: studentsQuery.data || [],
            isLoading: subjectsQuery.isLoading || classesQuery.isLoading
        },
        isFormValid,
        isSubmitting: createCourseMutation.isPending
    };
};