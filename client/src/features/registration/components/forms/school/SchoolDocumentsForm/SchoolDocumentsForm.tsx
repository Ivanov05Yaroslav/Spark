import React, { useState } from 'react';
import { toast } from '@/components/utils/Toast';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout';
import { FileUpload } from '@/components/ui/FileUpload/FileUpload';
import { SelectField } from "@/components/ui/SelectField/SelectField";
import { schoolService } from '@/features/registration/services/school.service';
import { SubmitSchoolDocsRequestDTO } from '@/features/registration/types/school.types';
import styles from './SchoolDocumentsForm.module.css';

const DOCUMENT_OPTIONS = [
    { value: 'edrDocs', label: 'Витяг з ЄДР' },
    { value: 'appointmentOrderDocs', label: 'Наказ про призначення на посаду директора' },
    { value: 'employmentContractDocs', label: 'Трудовий контракт керівника ЗЗСО' }
];

export const SchoolDocumentsForm = () => {
    const [isLoading, setIsLoading] = useState(false);

    const [passportFiles, setPassportFiles] = useState<File[]>([]);
    const [secondaryDocType, setSecondaryDocType] = useState<string>('');
    const [secondaryFiles, setSecondaryFiles] = useState<File[]>([]);

    const queryParams = new URLSearchParams(window.location.search);
    const sessionId = queryParams.get('sessionId') || '';

    const handleDocTypeChange = (newValue: string) => {
        setSecondaryDocType(newValue);
        setSecondaryFiles([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!sessionId) {
            return toast.error('Відсутній ідентифікатор сесії (sessionId)');
        }
        if (passportFiles.length === 0) {
            return toast.error('Будь ласка, завантажте хоча б один скан паспорта');
        }
        if (!secondaryDocType) {
            return toast.error('Будь ласка, оберіть тип додаткового документа');
        }
        if (secondaryFiles.length === 0) {
            return toast.error('Будь ласка, завантажте додатковий документ');
        }

        setIsLoading(true);

        try {
            const requestData = {
                sessionId,
                passportDocs: passportFiles,
                [secondaryDocType]: secondaryFiles
            } as SubmitSchoolDocsRequestDTO;

            const data = await schoolService.submitDocuments(requestData);

            toast.success(data.message || 'Документи успішно відправлено!');

            setTimeout(() => {
                window.location.href = `/`;
            }, 1000);

        } catch (err: any) {
            toast.error(err.message || 'Помилка при завантаженні документів');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormLayout
            title="ЗАЯВКА НА РЕЄСТРАЦІЮ ШКОЛИ"
            error={null}
            isLoading={isLoading}
            submitButtonText="ПІДТВЕРДИТИ"
            loadingButtonText="ВІДПРАВКА..."
            onSubmit={handleSubmit}
            showSocial={false}
        >
            <p className={styles.subtitle}>
                Будь ласка, завантажте документи, що підтверджують особу директора.
            </p>

            <div className={styles.formGrid}>
                <div className={styles.leftLabel}>
                    Паспорт громадянина України (Обов'язково)
                </div>

                <div className={styles.rightSelect}>
                    <SelectField
                        placeholder="Оберіть документ"
                        value={secondaryDocType}
                        options={DOCUMENT_OPTIONS}
                        onChange={handleDocTypeChange}
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.leftDropzone}>
                    <FileUpload
                        onFilesChange={setPassportFiles}
                        values={passportFiles}
                        maxFiles={5}
                    />
                </div>

                <div className={styles.rightDropzone}>
                    <FileUpload
                        onFilesChange={setSecondaryFiles}
                        values={secondaryFiles}
                        maxFiles={5}
                    />
                </div>
            </div>
        </FormLayout>
    );
};