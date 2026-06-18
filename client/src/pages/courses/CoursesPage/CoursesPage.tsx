import React, { useState } from 'react';
import { CoursesFilters } from '@/components/courses/CoursesFilters/CoursesFilters.tsx';
import { CourseCard } from '@/components/courses/CourseCard/CourseCard.tsx';
import { CoursesBanner } from "@/components/courses/CoursesBanner/CoursesBanner.tsx";
import styles from './CoursesPage.module.css';

interface Course {
    id: number;
    title: string;
    imageUrl: string;
    year: string;
    group: string;
    teacherName: string;
    teacherAvatar: string;
}

const MOCK_COURSES: Course[] = [
    {
        id: 1,
        title: 'Інформатика',
        imageUrl: 'https://www.aventusinformatics.com/_next/image?url=%2Fassets%2Fimages%2Fhome%2Fbanner%2Fcareer-banner.webp&w=3840&q=75',
        year: '2025-2026',
        group: '11-Б',
        teacherName: 'Шевченко Іван',
        teacherAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
    },
    {
        id: 1,
        title: 'Інформатика',
        imageUrl: 'https://www.aventusinformatics.com/_next/image?url=%2Fassets%2Fimages%2Fhome%2Fbanner%2Fcareer-banner.webp&w=3840&q=75',
        year: '2025-2026',
        group: '11-Б',
        teacherName: 'Шевченко Іван',
        teacherAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
    },{
        id: 1,
        title: 'Інформатика',
        imageUrl: 'https://www.aventusinformatics.com/_next/image?url=%2Fassets%2Fimages%2Fhome%2Fbanner%2Fcareer-banner.webp&w=3840&q=75',
        year: '2025-2026',
        group: '11-Б',
        teacherName: 'Шевченко Іван',
        teacherAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
    },
    {
        id: 1,
        title: 'Інформатика',
        imageUrl: 'https://www.aventusinformatics.com/_next/image?url=%2Fassets%2Fimages%2Fhome%2Fbanner%2Fcareer-banner.webp&w=3840&q=75',
        year: '2025-2026',
        group: '11-Б',
        teacherName: 'Шевченко Іван',
        teacherAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
    },
    {
        id: 1,
        title: 'Інформатика',
        imageUrl: 'https://www.aventusinformatics.com/_next/image?url=%2Fassets%2Fimages%2Fhome%2Fbanner%2Fcareer-banner.webp&w=3840&q=75',
        year: '2025-2026',
        group: '11-Б',
        teacherName: 'Шевченко Іван',
        teacherAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
    },
    {
        id: 1,
        title: 'Інформатика',
        imageUrl: 'https://www.aventusinformatics.com/_next/image?url=%2Fassets%2Fimages%2Fhome%2Fbanner%2Fcareer-banner.webp&w=3840&q=75',
        year: '2025-2026',
        group: '11-Б',
        teacherName: 'Шевченко Іван',
        teacherAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
    },
    {
        id: 1,
        title: 'Інформатика',
        imageUrl: 'https://www.aventusinformatics.com/_next/image?url=%2Fassets%2Fimages%2Fhome%2Fbanner%2Fcareer-banner.webp&w=3840&q=75',
        year: '2025-2026',
        group: '11-Б',
        teacherName: 'Шевченко Іван',
        teacherAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
    },
    {
        id: 1,
        title: 'Інформатика',
        imageUrl: 'https://www.aventusinformatics.com/_next/image?url=%2Fassets%2Fimages%2Fhome%2Fbanner%2Fcareer-banner.webp&w=3840&q=75',
        year: '2025-2026',
        group: '11-Б',
        teacherName: 'Шевченко Іван',
        teacherAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
    },
    {
        id: 1,
        title: 'Інформатика',
        imageUrl: 'https://www.aventusinformatics.com/_next/image?url=%2Fassets%2Fimages%2Fhome%2Fbanner%2Fcareer-banner.webp&w=3840&q=75',
        year: '2025-2026',
        group: '11-Б',
        teacherName: 'Шевченко Іван',
        teacherAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
    },
    {
        id: 1,
        title: 'Інформатика',
        imageUrl: 'https://www.aventusinformatics.com/_next/image?url=%2Fassets%2Fimages%2Fhome%2Fbanner%2Fcareer-banner.webp&w=3840&q=75',
        year: '2025-2026',
        group: '11-Б',
        teacherName: 'Шевченко Іван',
        teacherAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
    },
    {
        id: 1,
        title: 'Інформатика',
        imageUrl: 'https://www.aventusinformatics.com/_next/image?url=%2Fassets%2Fimages%2Fhome%2Fbanner%2Fcareer-banner.webp&w=3840&q=75',
        year: '2025-2026',
        group: '11-Б',
        teacherName: 'Шевченко Іван',
        teacherAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
    },


];

export const CoursesPage = () => {
    const [courses] = useState<Course[]>(MOCK_COURSES);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('in-process');
    const [sortBy, setSortBy] = useState('name');

    return (
        <div className={styles.pageContainer}>
            <CoursesFilters
                search={search}
                onSearchChange={setSearch}
                status={status}
                onStatusChange={setStatus}
                sortBy={sortBy}
                onSortByChange={setSortBy}
            />

            <CoursesBanner />

            <div className={styles.coursesGrid}>
                {courses.map((course) => (
                    <CourseCard
                        key={course.id}
                        title={course.title}
                        imageUrl={course.imageUrl}
                        year={course.year}
                        group={course.group}
                        teacherName={course.teacherName}
                        teacherAvatar={course.teacherAvatar}
                    />
                ))}
            </div>
        </div>
    );
};