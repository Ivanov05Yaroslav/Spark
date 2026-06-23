export const formatToStrictISO = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return '';

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return String(dateValue);

    return date.toISOString().replace(/\.\d{3}/, '');
};

export const formatToServerISO = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return '';
    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return String(dateValue);

    return date.toISOString();
};

export const formatToInputDate = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return '';
    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return String(dateValue);

    return date.toISOString().split('T')[0];
};