import { useState, useEffect, useCallback } from 'react';
import { administrationService } from '@/api/administration.service';
import { SchoolRequestDto, SchoolDetailsDto } from '@/types/administration.types';
import { toast } from '@/libs/configs/Toast';

export interface EnrichedSchoolRequest extends SchoolRequestDto {
  schoolName?: string;
  schoolAddress?: string;
}

export const useSchoolRequests = () => {
  const [requests, setRequests] = useState<EnrichedSchoolRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await administrationService.getPendingRequests();

      if (!data || data.length === 0) {
        setRequests([]);
        return;
      }

      const enrichedRequests = await Promise.all(
        data.map(async (request) => {
          try {
            const schoolData = await administrationService.getSchoolById(request.edeboId);

            return {
              ...request,
              schoolName: schoolData.shortName,
              schoolAddress: `${schoolData.koatuuName}, ${schoolData.address}`,
            };
          } catch (error) {
            console.error(`Не вдалося завантажити деталі для ЄДЕБО ${request.edeboId}`, error);
            return {
              ...request,
              schoolName: `Заклад з ЄДЕБО №${request.edeboId}`,
              schoolAddress: `Email: ${request.email}`,
            };
          }
        }),
      );

      setRequests(enrichedRequests);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Помилка при завантаженні заявок');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const executeAction = async (id: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    try {
      setIsActionLoading(true);
      let response;

      if (action === 'APPROVE') {
        response = await administrationService.approveRequest(id);
      } else {
        response = await administrationService.rejectRequest(id, reason || '');
      }

      const serverMessage = response?.data?.message || response?.message || 'Дію успішно виконано';

      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(serverMessage);

      await fetchRequests();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Сталася помилка при обробці заявки');
    } finally {
      setIsActionLoading(false);
    }
  };

  const fetchSchoolDetails = async (schoolId: string): Promise<SchoolDetailsDto | null> => {
    try {
      return await administrationService.getSchoolById(schoolId);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Помилка при завантаженні інформації про школу',
      );
      return null;
    }
  };

  return {
    requests,
    isLoading,
    isActionLoading,
    executeAction,
    refetch: fetchRequests,
    fetchSchoolDetails,
  };
};
