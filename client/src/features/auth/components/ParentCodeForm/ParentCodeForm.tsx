import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout.tsx';
import { Links } from '@/components/auth/Links/Links.tsx';
import { ChildCodeInput } from '@/components/auth/ChildCodeInput/ChildCodeInput.tsx';
import { SecondaryButton } from '@/components/ui/SecondaryButton/SecondaryButton.tsx';
import PlusIcon from '@/assets/plus.svg?react';
import styles from './ParentCodeForm.module.css';
import { registrationService } from '@/api/registration.service.ts';
import {toast} from "@/libs/configs/Toast.ts";

export const ParentCodeForm = () => {
    const navigate = useNavigate();
    const [codes, setCodes] = useState<string[]>(['']);
    const [isLoading, setIsLoading] = useState(false);

    const handleCodeChange = (index: number, val: string) => {
        const sanitized = val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
        const newCodes = [...codes];
        newCodes[index] = sanitized;
        setCodes(newCodes);
    };

    const handleAddChild = () => {
        if (codes.length < 5) {
            setCodes([...codes, '']);
        }
    };

    const handleRemoveChild = (index: number) => {
        const newCodes = codes.filter((_, i) => i !== index);
        setCodes(newCodes);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validCodes = codes.filter(code => code.length === 6);
        if (validCodes.length === 0) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await registrationService.registerParentInit({ childrenCodes: validCodes });

            toast.success(response.message);

            setTimeout(() => {
                navigate(`/parent/register/details?sessionId=${encodeURIComponent(response.sessionId)}`);
            }, 1000);
        } catch (err: any) {
            toast.error(err.message || 'Щось пішло не так');
        } finally {
            setIsLoading(false);
        }
    };

    const isSubmitDisabled = !codes.some(code => code.length === 6) || isLoading;

    return (
        <FormLayout
            title="РЕЄСТРАЦІЯ БАТЬКІВ"
            error={null}
            isLoading={isLoading}
            submitButtonText="ДАЛІ"
            loadingButtonText="ОБРОБКА..."
            onSubmit={handleSubmit}
            showSocial={false}
            isSubmitDisabled={isSubmitDisabled}
            links={
                <Links
                    leftText="Вже маєте акаунт?"
                    leftLinkText="Увійти"
                    onLeftLinkClick={() => navigate('/login')}
                />
            }
        >
            <p className={styles.subtitle}>
                Будь ласка, введіть батьківський код вашої дитини.
            </p>

            <div className={styles.codesContainer}>
                {codes.map((code, index) => (
                    <ChildCodeInput
                        key={index}
                        value={code}
                        disabled={isLoading}
                        onChange={(val) => handleCodeChange(index, val)}
                        label={codes.length > 1 ? `Дитина ${index + 1}` : undefined}
                        onRemove={codes.length > 1 ? () => handleRemoveChild(index) : undefined}
                    />
                ))}
            </div>

            {codes.length < 10 && (
                <SecondaryButton
                    disabled={isLoading}
                    onClick={handleAddChild}
                    icon={<PlusIcon className={styles.plusIcon} />}
                    className={styles.addBtnMargin}
                >
                    Додати ще одну дитину
                </SecondaryButton>
            )}
        </FormLayout>
    );
};

export default ParentCodeForm;