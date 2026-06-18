import { SearchInput } from '../../ui/SearchInput/SearchInput.tsx';
import { Select } from '../../ui/Select/Select.tsx';
import styles from './CoursesFilters.module.css';

interface CoursesFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    status: string;
    onStatusChange: (value: string) => void;
    sortBy: string;
    onSortByChange: (value: string) => void;
}

export const CoursesFilters = ({
                                   search,
                                   onSearchChange,
                                   status,
                                   onStatusChange,
                                   sortBy,
                                   onSortByChange
                               }: CoursesFiltersProps) => {
    const statusOptions = [
        { value: 'all', label: 'All' },
        { value: 'in-process', label: 'In process' },
        { value: 'completed', label: 'Completed' }
    ];

    const sortOptions = [
        { value: 'name', label: 'Sort by name' },
        { value: 'date', label: 'Sort by date' }
    ];

    return (
        <div className={styles.filtersContainer}>
            <div className={styles.searchWrapper}>
                <SearchInput
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search your course here...."
                />
            </div>
            <div className={styles.selectWrapper}>
                <Select
                    value={status}
                    onChange={onStatusChange}
                    options={statusOptions}
                />
            </div>
            <div className={styles.selectWrapper}>
                <Select
                    value={sortBy}
                    onChange={onSortByChange}
                    options={sortOptions}
                />
            </div>
        </div>
    );
};