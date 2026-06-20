export const formatToStrictISO = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return '';

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return String(dateValue);

    return date.toISOString().replace(/\.\d{3}/, '');
};

export const getYearRange = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return '';
    const startYear = new Date(startStr).getFullYear();
    const endYear = new Date(endStr).getFullYear();
    return startYear === endYear ? `${startYear}` : `${startYear}-${endYear}`;
};

export const formatToInputDate = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return '';
    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return String(dateValue);

    return date.toISOString().split('T')[0];
};