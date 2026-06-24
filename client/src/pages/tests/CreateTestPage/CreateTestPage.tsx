import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateTestForm } from '@/features/tests/components/CreateTestForm/CreateTestForm';

export const CreateTestPage: React.FC = () => {
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate(-1);
    };

    return (
        <CreateTestForm onBack={handleBackClick} />
    );
};