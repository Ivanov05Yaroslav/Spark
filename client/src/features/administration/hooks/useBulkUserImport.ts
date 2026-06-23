import { useState } from 'react';
import { administrationService } from '@/api/administration.service';
import { toast } from '@/libs/configs/Toast';

export const useBulkUserImport = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        try {
            const data = await administrationService.bulkRegisterUsers(file);
            toast.success(data?.message || 'Пользователи успешно импортированы!');
            return true;
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Произошла ошибка при импорте файла.');
            return false;
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileDownload = async (fetchFunction: () => Promise<any>) => {
        setIsDownloading(true);
        try {
            const data = await fetchFunction();

            const downloadUrl = typeof data === 'string' ? data : data?.url;

            if (!downloadUrl) {
                throw new Error("Ссылка не найдена в ответе сервера");
            }

            const a = document.createElement('a');
            a.href = downloadUrl;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Не удалось получить ссылку на файл.');
        } finally {
            setIsDownloading(false);
        }
    };

    const downloadTemplate = () => handleFileDownload(administrationService.downloadBulkTemplate);
    const downloadInstructions = () => handleFileDownload(administrationService.downloadBulkInstructions);

    return {
        uploadFile,
        downloadTemplate,
        downloadInstructions,
        isUploading,
        isDownloading
    };
};