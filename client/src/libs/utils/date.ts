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

export const formatToDisplayDeadline = (dateValue: string | Date | null | undefined): string | null => {
    if (!dateValue) return null;

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return String(dateValue);

    const dateString = date.toLocaleDateString('uk-UA', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const timeString = date.toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return `Термін: ${dateString} о ${timeString}`;
};