import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useCourseData } from '../hooks/useCourseData';
import { courseService } from '@/api/courses.service';
import { toast } from '@/libs/configs/Toast';
import { formatToInputDate, formatToStrictISO } from '@/libs/utils/date';

export const useEditCourse = () => {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [isInitialized, setIsInitialized] = useState(false);

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
    const [existingBackgroundUrl, setExistingBackgroundUrl] = useState<string | null>(null);
    const [isHidden, setIsHidden] = useState(false);

    const { data: courseDetail, isLoading: isCourseLoading } = useQuery({
        queryKey: ['course', id],
        queryFn: () => courseService.getCourseById(id!),
        enabled: !!id,
    });

    useEffect(() => {
        if (courseDetail && !isInitialized) {
            setSubject(courseDetail.subjectId || '');
            setGrade(courseDetail.classId || '');

            if (courseDetail.startDate) setStartDate(formatToInputDate(courseDetail.startDate));
            if (courseDetail.endDate) setEndDate(formatToInputDate(courseDetail.endDate));

            setThemeColor(courseDetail.themeColor || 'purple');
            setIsHidden(courseDetail.isHidden || false);
            setExistingBackgroundUrl(courseDetail.backgroundUrl || null);

            if (courseDetail.coTeachers && courseDetail.coTeachers.length > 0) {
                setCoTeachers(courseDetail.coTeachers.map((t: any) => t.id));
            } else {
                setCoTeachers([]);
            }

            if (courseDetail.groupName) {
                setIsDivided(true);
                const cleanGroupName = courseDetail.groupName.replace(/^Група\s+/i, '').trim();
                setGroupName(cleanGroupName);

                if (courseDetail.students && courseDetail.students.length > 0) {
                    setStudents(courseDetail.students.map((s: any) => s.id));
                }
            } else {
                setIsDivided(false);
                setGroupName('');
                setStudents([]);
            }

            setIsInitialized(true);
        }
    }, [courseDetail, isInitialized]);

    const { teachersQuery, studentsQuery } = useCourseData(subject, grade);

    const handleIsDividedChange = (checked: boolean) => {
        setIsDivided(checked);
        if (!checked) {
            setGroupName('');
            setStudents([]);
        }
    };

    const updateCourseMutation = useMutation({
        mutationFn: (formData: FormData) => courseService.updateCourse(id!, formData),
        onSuccess: () => {
            toast.success("Курс успішно оновлено!");
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            queryClient.invalidateQueries({ queryKey: ['course', id] });
            setTimeout(() => {
                navigate(-1);
            }, 1500);
        },
        onError: () => {
            toast.error("Сталася помилка при оновленні курсу");
        }
    });

    const handleUpdate = () => {
        const formData = new FormData();

        formData.append('subjectId', subject.trim());
        formData.append('classId', grade.trim());
        formData.append('startDate', formatToStrictISO(startDate));
        formData.append('endDate', formatToStrictISO(endDate));
        formData.append('themeColor', themeColor.trim());
        formData.append('isHidden', String(isHidden));

        if (coTeachers && coTeachers.length > 0) {
            formData.append('coTeacherIds', coTeachers.map(tId => tId.trim()).join(','));
        }

        if (isDivided) {
            let finalGroupName = groupName.trim();
            if (!finalGroupName) {
                finalGroupName = 'Група 1';
            } else if (!finalGroupName.toLowerCase().includes('груп')) {
                finalGroupName = `Група ${finalGroupName}`;
            }
            formData.append('groupName', finalGroupName);

            if (students && students.length > 0) {
                formData.append('studentIds', students.map(sId => sId.trim()).join(','));
            }
        }

        if (backgroundFiles.length > 0) {
            formData.append('backgroundImage', backgroundFiles[0]);
        }

        updateCourseMutation.mutate(formData);
    };

    const isBaseValid = !!(subject && grade && startDate && endDate);
    const isGroupValid = isDivided ? !!(groupName && students.length > 0) : true;
    const isFormValid = isBaseValid && isGroupValid;

    return {
        values: {
            subject, grade, startDate, endDate, coTeachers,
            isDivided, groupName, students, themeColor, backgroundFiles,
            isHidden, existingBackgroundUrl,
            isEditMode: true
        },
        handlers: {
            setSubject, setGrade, setStartDate, setEndDate, setCoTeachers,
            setIsDivided, setGroupName, setStudents,
            handleIsDividedChange, handleUpdate,
            setThemeColor, setBackgroundFiles,
            setIsHidden, setExistingBackgroundUrl
        },
        data: {
            subjects: courseDetail?.subject
                ? [{ value: courseDetail.subject.id, label: courseDetail.subject.name }]
                : [],
            classes: courseDetail?.class
                ? [{ value: courseDetail.class.id, label: courseDetail.class.name }]
                : [],
            teachers: teachersQuery?.data || [],
            students: studentsQuery?.data || [],
            isLoading: isCourseLoading || teachersQuery?.isLoading || studentsQuery?.isLoading
        },
        isFormValid,
        isCourseLoading,
        isSubmitting: updateCourseMutation.isPending
    };
};