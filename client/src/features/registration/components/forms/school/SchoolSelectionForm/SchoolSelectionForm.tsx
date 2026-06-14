import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/utils/Toast';
import { SelectField } from '@/components/ui/SelectField/SelectField';
import { Links } from '@/components/auth/Links/Links.tsx';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout.tsx';
import styles from "@/features/registration/components/forms/school/SchoolSelectionForm/SchoolSelectionForm.module.css";
import { schoolService } from '@/features/registration/services/school.service';
import { SelectOption } from '@/components/ui/Select/Select';

export const SchoolSelectionForm = () => {
    const [region, setRegion] = useState('');
    const [city, setCity] = useState('');
    const [schoolId, setSchoolId] = useState('');

    const [regionOptions, setRegionOptions] = useState<SelectOption[]>([]);
    const [cityOptions, setCityOptions] = useState<SelectOption[]>([]);
    const [schoolOptions, setSchoolOptions] = useState<SelectOption[]>([]);

    const [isLoadingRegions, setIsLoadingRegions] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isLoadingSchools, setIsLoadingSchools] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchRegions = async () => {
            setIsLoadingRegions(true);
            try {
                const data = await schoolService.getRegions();
                const options = data.map(r => ({ value: r, label: r }));
                setRegionOptions(options);
            } catch (err: any) {
                toast.error(err.message || 'Не вдалося завантажити список областей');
            } finally {
                setIsLoadingRegions(false);
            }
        };
        fetchRegions();
    }, []);

    const handleRegionChange = async (newRegion: string) => {
        if (newRegion === region) return;

        setRegion(newRegion);

        setCity('');
        setSchoolId('');
        setCityOptions([]);
        setSchoolOptions([]);

        if (!newRegion) return;

        setIsLoadingCities(true);
        try {
            const data = await schoolService.getCities(newRegion);
            const options = data.map(c => ({ value: c, label: c }));
            setCityOptions(options);
        } catch (err: any) {
            toast.error(err.message || 'Не вдалося завантажити список міст');
        } finally {
            setIsLoadingCities(false);
        }
    };

    const handleCityChange = async (newCity: string) => {
        if (newCity === city) return;

        setCity(newCity);

        setSchoolId('');
        setSchoolOptions([]);

        if (!newCity) return;

        setIsLoadingSchools(true);
        try {
            const data = await schoolService.getSchools(newCity);
            const options = data.map(s => ({ value: s.edeboId, label: s.fullName }));
            setSchoolOptions(options);
        } catch (err: any) {
            toast.error(err.message || 'Не вдалося завантажити список шкіл');
        } finally {
            setIsLoadingSchools(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!region || !city || !schoolId) {
            return toast.error('Будь ласка, оберіть область, населений пункт та навчальний заклад');
        }

        setIsSubmitting(true);

        try {
            const data = await schoolService.initSchoolRegistration({ edeboId: schoolId });

            toast.success(data.message || 'Школу успішно обрано!');

            setTimeout(() => {
                navigate(`/school/register/details?sessionId=${data.sessionId}`);
            }, 1000);

        } catch (err: any) {
            toast.error(err.message || 'Помилка при виборі школи');
        } finally {
            setIsSubmitting(false);
        }
    };

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