import {ThemeColor} from "@/types/courses.types";

export const DEFAULT_THEME_COLORS: ThemeColor[] = [
    { value: 'purple', base: '#B88BFF' },
    { value: 'pink', base: '#D6709E' },
    { value: 'green', base: '#70A97A' },
    { value: 'peach', base: '#E38859' },
    { value: 'blue', base: '#7C93FF' },
    { value: 'grey', base: '#9A9A9A' },
    { value: 'red', base: '#E06D6D' },
    { value: 'yellow', base: '#E5C247' },
    { value: 'teal', base: '#5EB496' },
];

export const COURSE_STATUS_OPTIONS = [
    { value: 'ALL', label: 'Усі' },
    { value: 'IN_PROGRESS', label: 'В процесі' },
    { value: 'PLANNED', label: 'Заплановані' },
    { value: 'ARCHIVED', label: 'Архівовані' }
];

export const COURSE_SORT_BY_OPTIONS = [
    { value: 'NAME', label: 'За назвою' },
    { value: 'START_DATE', label: 'За датою' }
];

export const COURSE_SORT_ORDER = [
    { value: 'asc', label: 'За зростанням' },
    { value: 'desc', label: 'За спаданням' }
];
