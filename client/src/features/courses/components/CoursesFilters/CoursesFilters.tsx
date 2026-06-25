import { SearchInput } from '../../../../components/ui/SearchInput/SearchInput.tsx';
import { Select } from '../../../../components/ui/Select/Select.tsx';
import { CustomCheckbox } from '../../../../components/ui/CustomCheckbox/CustomCheckbox.tsx';
import {
  COURSE_STATUS_OPTIONS,
  COURSE_SORT_BY_OPTIONS,
  COURSE_SORT_ORDER,
} from '@/libs/constants/courses.constants.ts';
import styles from './CoursesFilters.module.css';

interface CoursesFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;

  activeRole?: string | null;
  isCreator?: boolean;
  onIsCreatorChange?: (value: boolean) => void;
  childId?: string;
  onChildIdChange?: (value: string) => void;
  childrenOptions?: { value: string; label: string }[];
}

export const CoursesFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  activeRole, // <---
  isCreator = false,
  onIsCreatorChange,
  childId,
  onChildIdChange,
  childrenOptions = [],
}: CoursesFiltersProps) => {
  return (
    <div className={styles.filtersContainer}>
      <div className={styles.searchWrapper}>
        <SearchInput
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Шукайте ваш курс тут..."
        />
      </div>

      {activeRole === 'PARENT' && onChildIdChange && childrenOptions.length > 0 && (
        <div className={styles.selectWrapper}>
          <Select value={childId || ''} onChange={onChildIdChange} options={childrenOptions} />
        </div>
      )}

      <div className={styles.selectWrapper}>
        <Select value={status} onChange={onStatusChange} options={COURSE_STATUS_OPTIONS} />
      </div>

      <div className={styles.selectWrapper}>
        <Select value={sortBy} onChange={onSortByChange} options={COURSE_SORT_BY_OPTIONS} />
      </div>

      <div className={styles.selectWrapper}>
        <Select value={sortOrder} onChange={onSortOrderChange} options={COURSE_SORT_ORDER} />
      </div>

      {activeRole === 'TEACHER' && onIsCreatorChange && (
        <div className={styles.checkboxWrapper}>
          <CustomCheckbox
            label="Тільки створені мною"
            checked={isCreator}
            onChange={(e) => onIsCreatorChange(e.target.checked)}
          />
        </div>
      )}
    </div>
  );
};
