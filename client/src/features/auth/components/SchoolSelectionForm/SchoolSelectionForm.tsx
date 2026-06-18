import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SelectField } from '@/components/ui/SelectField/SelectField.tsx';
import { Links } from '@/components/auth/Links/Links.tsx';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout.tsx';
import { useSchoolSelection } from '../../hooks/useSchoolSelection';
import styles from './SchoolSelectionForm.module.css';

export const SchoolSelectionForm = () => {
    const navigate = useNavigate();

    const {
        region, handleRegionChange, regionOptions, isLoadingRegions,
        city, handleCityChange, cityOptions, isLoadingCities,
        schoolId, setSchoolId, schoolOptions, isLoadingSchools,
        handleSubmit, isSubmitting
    } = useSchoolSelection();

    return (
        <FormLayout
            title="ЗАЯВКА НА РЕЄСТРАЦІЮ ШКОЛИ"
            error={null}
            isLoading={isSubmitting}
            submitButtonText="ДАЛІ"
            loadingButtonText="ЗАВАНТАЖЕННЯ..."
            onSubmit={handleSubmit}
            showSocial={false}
            links={
                <Links
                    leftText="Школа вже зареєстрована?"
                    leftLinkText="Увійти"
                    onLeftLinkClick={() => navigate('/login')}
                />
            }
        >
            <p className={styles.subtitle}>
                Будь ласка, оберіть школу.
            </p>

            <SelectField
                label="Область"
                placeholder={isLoadingRegions ? "Завантаження..." : "Оберіть область"}
                value={region}
                options={regionOptions}
                onChange={handleRegionChange}
                disabled={isLoadingRegions || isSubmitting}
            />

            <SelectField
                label="Населений пункт"
                placeholder={isLoadingCities ? "Завантаження..." : "Оберіть населений пункт"}
                value={city}
                options={cityOptions}
                onChange={handleCityChange}
                disabled={!region || isLoadingCities || isSubmitting}
            />

            <SelectField
                label="Навчальний заклад"
                placeholder={isLoadingSchools ? "Завантаження..." : "Оберіть заклад"}
                value={schoolId}
                options={schoolOptions}
                onChange={setSchoolId}
                disabled={!city || isLoadingSchools || isSubmitting}
            />
        </FormLayout>
    );
};