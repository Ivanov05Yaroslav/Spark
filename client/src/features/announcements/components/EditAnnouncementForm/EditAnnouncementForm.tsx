import React from 'react';
import { SelectField } from '@/components/ui/SelectField/SelectField.tsx';
import { Input } from '@/components/ui/Input/Input.tsx';
import { TextAreaField } from '@/components/ui/TextAreaField/TextAreaField.tsx';

interface EditAnnouncementFormProps {
    values: {
        subjectId: string | undefined;
        classId: string | undefined;
        topicName: string;
        text: string;
    };
    handlers: {
        setTopicName: (value: string) => void;
        setText: (value: string) => void;
    };
    data: {
        subjectOptions: Array<{ value: string; label: string }>;
        classOptions: Array<{ value: string; label: string }>;
    };
    isSubmitting: boolean;
}

export const EditAnnouncementForm = ({
                                         values,
                                         handlers,
                                         data,
                                         isSubmitting
                                     }: EditAnnouncementFormProps) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            <SelectField
                label="Предмет"
                placeholder="Завантаження..."
                options={data.subjectOptions}
                value={values.subjectId || ''}
                disabled={true}
            />

            <SelectField
                label="Клас"
                placeholder="Завантаження..."
                options={data.classOptions}
                value={values.classId || ''}
                disabled={true}
            />

            <Input
                label="Назва теми"
                placeholder="Введіть назву теми"
                value={values.topicName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlers.setTopicName(e.target.value)}
                disabled={isSubmitting}
            />

            <TextAreaField
                label="Текст"
                placeholder="Введіть текст оголошення"
                value={values.text}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handlers.setText(e.target.value)}
                disabled={isSubmitting}
            />
        </div>
    );
};