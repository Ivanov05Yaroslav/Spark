import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/libs/configs/Toast.ts';
import { authService } from '@/api/auth.service.ts';

export const useSchoolSelection = () => {
  const navigate = useNavigate();

  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [schoolId, setSchoolId] = useState('');

  const { data: regions = [], isLoading: isLoadingRegions } = useQuery({
    queryKey: ['regions'],
    queryFn: () => authService.getRegions(),
  });

  const { data: cities = [], isLoading: isLoadingCities } = useQuery({
    queryKey: ['cities', region],
    queryFn: () => authService.getCities(region),
    enabled: !!region,
  });

  const { data: schools = [], isLoading: isLoadingSchools } = useQuery({
    queryKey: ['schools', city],
    queryFn: () => authService.getSchools(city),
    enabled: !!city,
  });

  const mutation = useMutation({
    mutationFn: (edeboId: string) => authService.initSchoolRegistration({ edeboId }),
    onSuccess: (data) => {
      toast.success(data.message || 'Школу успішно обрано!');
      setTimeout(() => {
        navigate(`/school/register/details?sessionId=${data.sessionId}`);
      }, 1000);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Помилка при виборі школи');
    },
  });

  const handleRegionChange = (newRegion: string) => {
    if (newRegion === region) return;
    setRegion(newRegion);
    setCity('');
    setSchoolId('');
  };

  const handleCityChange = (newCity: string) => {
    if (newCity === city) return;
    setCity(newCity);
    setSchoolId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!region || !city || !schoolId) {
      return toast.error('Будь ласка, оберіть область, населений пункт та навчальний заклад');
    }

    mutation.mutate(schoolId);
  };

  const regionOptions = regions.map((r: string) => ({ value: r, label: r }));
  const cityOptions = cities.map((c: string) => ({ value: c, label: c }));
  const schoolOptions = schools.map((s: any) => ({ value: s.edeboId, label: s.fullName }));

  return {
    region,
    handleRegionChange,
    regionOptions,
    isLoadingRegions,
    city,
    handleCityChange,
    cityOptions,
    isLoadingCities,
    schoolId,
    setSchoolId,
    schoolOptions,
    isLoadingSchools,
    handleSubmit,
    isSubmitting: mutation.isPending,
  };
};
