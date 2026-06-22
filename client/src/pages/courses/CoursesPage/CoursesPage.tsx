import React from 'react';
import { CoursesFilters } from '@/features/courses/components/CoursesFilters/CoursesFilters.tsx';
import { CoursesBanner } from '@/features/courses/components/CoursesBanner/CoursesBanner.tsx';
import { CoursesList } from '@/features/courses/components/CoursesList/CoursesList.tsx';
import { useMyCourses } from '@/features/courses/hooks/useMyCourses.ts';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabItem } from '@/components/ui/Tabs/Tabs';
import { ROLE_LABELS } from '@/libs/constants/users.constants';
import styles from './CoursesPage.module.css';

export const CoursesPage = () => {
    const navigate = useNavigate();

    const {
        courses,
        isLoading,
        search,
        setSearch,
        status,
        setStatus,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        activeRole,
        setActiveRole,
        availableRoles,
        isCreator,
        setIsCreator,
        childId,
        setChildId,
        children,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    } = useMyCourses();

    const handleCreateCourseClick = () => {
        navigate('/courses/create');
    };

    const childrenOptions = children.map((child: any) => ({
        value: child.id,
        label: `${child.firstName} ${child.lastName}`
    }));

    const roleTabs: TabItem[] = availableRoles.map((role) => ({
        id: role,
        label: ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role,
    }));

    return (
        <div className={styles.pageContainer}>
            <CoursesBanner
                onCreateClick={handleCreateCourseClick}
                showCreateButton={activeRole === 'TEACHER'}
            />

            {availableRoles.length > 1 && (
                <div className={styles.tabsWrapper}>
                    <Tabs
                        items={roleTabs}
                        activeId={activeRole}
                        onTabChange={setActiveRole}
                    />
                </div>
            )}

            <CoursesFilters
                search={search}
                onSearchChange={setSearch}
                status={status}
                onStatusChange={setStatus}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}

                activeRole={activeRole}
                isCreator={isCreator}
                onIsCreatorChange={setIsCreator}
                childId={childId}
                onChildIdChange={setChildId}
                childrenOptions={childrenOptions}
            />

            <CoursesList
                courses={courses}
                isLoading={isLoading}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
                activeRole={activeRole}
            />
        </div>
    );
};