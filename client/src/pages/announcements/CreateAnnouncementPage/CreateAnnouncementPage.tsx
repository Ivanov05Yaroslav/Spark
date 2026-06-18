import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CenteredFormLayout } from '@/components/layout/CenteredFormLayout/CenteredFormLayout.tsx';
import { MultiSelectField } from '@/components/ui/MultiSelectField/MultiSelectField.tsx';
import { Input } from '@/components/ui/Input/Input.tsx';
import { TextAreaField } from '@/components/ui/TextAreaField/TextAreaField.tsx';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton.tsx';

const courseOptions = [
    { value: 'course-1', label: 'Математика — 5 клас' },
    { value: 'course-2', label: 'Англійська мова — 6 клас' },
    { value: 'course-3', label: 'Природничі науки — 7 клас' },
];

export const CreateAnnouncementPage = () => {
    const navigate = useNavigate();

    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [topicName, setTopicName] = useState('');
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isSubmitDisabled = selectedCourses.length === 0 || !topicName.trim();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            console.log('Creating...', { selectedCourses, topicName, text });
            navigate(-1);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CenteredFormLayout
            title="СТВОРЕННЯ ОГОЛОШЕННЯ"
            onBack={() => navigate(-1)}
            showButton={true}
            buttonText="Створити"
        >
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <MultiSelectField
                    label="Курс"
                    placeholder="Оберіть курс"
                    options={courseOptions}
                    value={selectedCourses}
                    onChange={setSelectedCourses}
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

                <PrimaryButton type="submit" disabled={isLoading || isSubmitDisabled}>
                    {isLoading ? 'СТВОРЕННЯ...' : 'СТВОРИТИ'}
                </PrimaryButton>
            </form>
        </CenteredFormLayout>
    );
};