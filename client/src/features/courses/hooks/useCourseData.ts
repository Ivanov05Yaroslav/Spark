import { useQuery } from '@tanstack/react-query';
import { courseService } from '@/api/courses.service';

export const useCourseData = (selectedSubject?: string, selectedClass?: string) => {
    const subjectsQuery = useQuery({
        queryKey: ['subjects'],
        queryFn: courseService.getMySubjects
    });

    const classesQuery = useQuery({
        queryKey: ['classes'],
        queryFn: courseService.getClasses
    });

    const teachersQuery = useQuery({
        queryKey: ['teachers', selectedSubject],
        queryFn: () => courseService.getCoTeachers(selectedSubject!),
        enabled: !!selectedSubject
    });

    const studentsQuery = useQuery({
        queryKey: ['students', selectedClass],
        queryFn: () => courseService.getStudents(selectedClass!),
        enabled: !!selectedClass
    });

    return { subjectsQuery, classesQuery, teachersQuery, studentsQuery };
};