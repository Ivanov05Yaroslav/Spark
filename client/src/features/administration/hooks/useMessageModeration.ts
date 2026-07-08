import { useState, useEffect, useCallback } from 'react';
import { administrationService } from '@/api/administration.service';
import { CommentReportDto, CommentReportsQueryParams } from '@/types/administration.types';
import { toast } from '@/libs/configs/Toast';

export const useMessageModeration = (initialParams: CommentReportsQueryParams = {}) => {
  const [reports, setReports] = useState<CommentReportDto[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [queryParams, setQueryParams] = useState<CommentReportsQueryParams>({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialParams,
  });

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);

      const cleanParams = { ...queryParams };
      if (!cleanParams.status) delete cleanParams.status;
      if (!cleanParams.search) delete cleanParams.search;
      if (!cleanParams.sortBy) delete cleanParams.sortBy;

      const response = await administrationService.getCommentReports(cleanParams);

      setReports(response.data || []);
      setTotalItems(response.meta?.total || 0);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Помилка при завантаженні скарг');
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleParamChange = (field: keyof CommentReportsQueryParams, value: any) => {
    setQueryParams((prev) => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? value : 1,
    }));
  };

  const executeReportAction = async (reportId: string, action: string, successMessage: string) => {
    try {
      setIsActionLoading(true);

      const response = await administrationService.resolveReport(reportId, { action });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(response?.data?.message || successMessage);
      await fetchReports();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Сталася помилка при обробці скарги');
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    reports,
    totalItems,
    totalPages,
    queryParams,
    isLoading,
    isActionLoading,
    handleParamChange,
    executeReportAction,
    refetch: fetchReports,
  };
};
