import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CenteredFormLayout } from '@/components/layout/CenteredFormLayout/CenteredFormLayout';
import { MultiSelectField } from '@/components/ui/MultiSelectField/MultiSelectField';
import { Input } from '@/components/ui/Input/Input';
import { TextAreaField } from '@/components/ui/TextAreaField/TextAreaField';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton';

const courseOptions = [
    { value: 'course-1', label: 'Математика — 5 клас' },
    { value: 'course-2', label: 'Англійська мова — 6 клас' },
    { value: 'course-3', label: 'Природничі науки — 7 клас' },
];

export const EditAnnouncementPage = () => {
    const navigate = useNavigate();

    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [topicName, setTopicName] = useState('');
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isSubmitDisabled = selectedCourses.length === 0 || !topicName.trim();

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        console.log('Updating announcement:', {
            courses: selectedCourses,
            topicName,
            text
        });

        try {
            navigate(-1);
        } catch (error) {
            console.error('Error updating announcement:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CenteredFormLayout
            title="РЕДАГУВАННЯ ОГОЛОШЕННЯ"
            onBack={() => navigate(-1)}
            showButton={true}
            buttonText="Зберегти"
        >
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <MultiSelectField
                    label="Курс"
                    placeholder="Оберіть курс"
                    options={courseOptions}
                    value={selectedCourses}
                    onChange={setSelectedCourses}
                    disabled={true}
                />

                <Input
                    label="Назва теми"
                    placeholder="Введіть назву теми"
                    value={topicName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopicName(e.target.value)}
                />

                <TextAreaField
                    label="Текст"
                    placeholder="Введіть текст (необов'язково)"
                    value={text}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
                />

                <PrimaryButton
                    type="submit"
                    disabled={isLoading || isSubmitDisabled}
                >
                    {isLoading ? 'ЗБЕРЕЖЕННЯ...' : 'ЗБЕРЕГТИ'}
                </PrimaryButton>
            </form>
        </CenteredFormLayout>
    );
};