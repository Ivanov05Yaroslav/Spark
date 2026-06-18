import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout.tsx';
import { Links } from '@/components/auth/Links/Links.tsx';
import { ChildCodeInput } from '@/components/auth/ChildCodeInput/ChildCodeInput.tsx';
import { SecondaryButton } from '@/components/ui/SecondaryButton/SecondaryButton.tsx';
import PlusIcon from '@/assets/plus.svg?react';
import { useParentCode } from '@/features/auth/hooks/useParentCode';
import styles from './ParentCodeForm.module.css';

export const ParentCodeForm = () => {
    const navigate = useNavigate();
    const {
        codes,
        handleCodeChange,
        handleAddChild,
        handleRemoveChild,
        handleSubmit,
        isLoading,
        isSubmitDisabled
    } = useParentCode();

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