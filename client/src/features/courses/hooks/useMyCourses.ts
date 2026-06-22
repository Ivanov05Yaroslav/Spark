import { useState, useMemo, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { courseService } from '@/api/courses.service';
import { useStore } from '@/stores/useStore';

export const useMyCourses = () => {
    const user = useStore((state) => state.user);

    const availableRoles = useMemo(() => {
        if (!user?.roles?.length) return [];
        return user.roles.map(r => r.replace('ROLE_', '').toUpperCase());
    }, [user?.roles]);

    const [activeRole, setActiveRole] = useState<string>('');

    useEffect(() => {
        if (availableRoles.length > 0 && !activeRole) {
            if (availableRoles.includes('TEACHER')) setActiveRole('TEACHER');
            else if (availableRoles.includes('STUDENT')) setActiveRole('STUDENT');
            else if (availableRoles.includes('PARENT')) setActiveRole('PARENT');
            else setActiveRole(availableRoles[0]);
        }
    }, [availableRoles, activeRole]);

    const children = user?.children || [];

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('ALL');
    const [sortBy, setSortBy] = useState('NAME');
    const [sortOrder, setSortOrder] = useState('asc');

    const [isCreator, setIsCreator] = useState(true);
    const [childId, setChildId] = useState<string>(children?.[0]?.id || '');

    useEffect(() => {
        if (!childId && children.length > 0) {
            setChildId(children[0].id);
        }
    }, [children, childId]);

    const params: Record<string, string | boolean> = {};

    if (search.trim()) params.search = search;
    if (status) params.filter = status;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    if (activeRole) params.roleContext = activeRole;

    if (activeRole === 'TEACHER') {
        params.isCreator = isCreator;
    }

    if (activeRole === 'PARENT' && childId) {
        params.childId = childId;
    }

    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['courses', activeRole, { search, status, sortBy, sortOrder, isCreator, childId }],
        queryFn: ({ pageParam = 1 }) => courseService.getCourses({
            ...params,
            page: String(pageParam),
            limit: '8'
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage: any) => {
            const meta = lastPage?.meta;
            if (!meta) return undefined;

            const currentPage = Number(meta.page);
            const totalPages = Number(meta.totalPages);

            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        enabled: !!activeRole,
    });

    const courses = data ? data.pages.flatMap((page: any) => page.data || []) : [];

    return {
        courses,
        isLoading,
        error,
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
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    };
};