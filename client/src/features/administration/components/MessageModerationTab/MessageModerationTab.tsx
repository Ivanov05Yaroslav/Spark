import React, { useEffect } from 'react';
import { SearchInput } from '@/components/ui/SearchInput/SearchInput';
import {
  ModerationReportCard,
  ModerationStatus,
} from '@/components/administration/ModerationReportCard/ModerationReportCard';
import styles from './MessageModerationTab.module.css';
import { COURSE_SORT_ORDER } from '@/libs/constants/courses.constants.ts';
import { Select } from '@/components/ui/Select/Select.tsx';
import { STATUS, MODERATION_SORT_BY } from '@/libs/constants/administration.constants.ts';
import { useMessageModeration } from '@/features/administration/hooks/useMessageModeration';

export const MessageModerationTab = () => {
  const {
    reports,
    isLoading,
    isActionLoading,
    queryParams,
    handleParamChange,
    executeReportAction,
    totalPages,
  } = useMessageModeration();

  const statusOptions = (STATUS || []).map((item) => ({
    value: item.id,
    label: item.label,
  }));

  const sortByOptions = (MODERATION_SORT_BY || []).map((item) => ({
    value: item.id,
    label: item.label,
  }));

  const sortOrderOptions = (COURSE_SORT_ORDER || []).map((item: any) => ({
    value: item.value || item.id,
    label: item.label,
  }));

  const getRoleLabel = (roles: string[] | undefined) => {
    if (!roles || roles.length === 0) return 'Користувач';
    if (roles.includes('SUPER_ADMIN')) return 'Супер Адмін';
    if (roles.includes('ADMIN')) return 'Адміністратор';
    if (roles.includes('TEACHER')) return 'Вчитель';
    if (roles.includes('PARENT')) return 'Батько/Мати';
    return 'Учень';
  };

  useEffect(() => {
    console.log('Компонент MessageModerationTab успешно отрендерился!');
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.filtersContainer}>
        <div className={styles.searchWrapper}>
          <SearchInput
            placeholder="Пошук скарг за текстом або користувачем..."
            value={queryParams.search || ''}
            onChange={(e) => handleParamChange('search', e.target.value)}
          />
        </div>
        <div className={styles.selectWrapper}>
          <Select
            value={queryParams.status || ''}
            onChange={(value) => handleParamChange('status', value)}
            options={statusOptions}
          />
        </div>
        <div className={styles.selectWrapper}>
          <Select
            value={queryParams.sortBy || 'createdAt'}
            onChange={(value) => handleParamChange('sortBy', value)}
            options={sortByOptions}
          />
        </div>
        <div className={styles.selectWrapper}>
          <Select
            value={queryParams.sortOrder || 'desc'}
            onChange={(value) => handleParamChange('sortOrder', value)}
            options={sortOrderOptions}
          />
        </div>
      </div>

      <div className={styles.list}>
        {isLoading ? (
          <div className={styles.emptyState}>
            <p>Завантаження скарг модерації...</p>
          </div>
        ) : reports.length > 0 ? (
          reports.map((report) => {
            const formattedTime = report.comment?.createdAt
              ? new Date(report.comment.createdAt).toLocaleTimeString('uk-UA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            const cardReporter = {
              id: report.reporter?.id,
              firstName: report.reporter?.firstName || 'Невідомо',
              lastName: report.reporter?.lastName || '',
              middleName: report.reporter?.middleName || '',
              role: report.reporter?.roles?.[0] || 'STUDENT',
              roleLabel: getRoleLabel(report.reporter?.roles),
              avatarUrl: report.reporter?.avatarUrl || undefined,
            };

            const cardReportedUser = {
              id: report.reportedUser?.id,
              firstName: report.reportedUser?.firstName || 'Невідомо',
              lastName: report.reportedUser?.lastName || '',
              middleName: report.reportedUser?.middleName || '',
              role: report.reportedUser?.roles?.[0] || 'STUDENT',
              roleLabel: getRoleLabel(report.reportedUser?.roles),
              avatarUrl: report.reportedUser?.avatarUrl || undefined,
            };

            return (
              <ModerationReportCard
                key={report.id}
                id={report.id}
                reporter={cardReporter}
                reportedUser={cardReportedUser}
                messageText={report.comment?.content || 'Повідомлення відсутнє'}
                messageTime={formattedTime}
                reportReason={report.reason || 'Причина не вказана'}
                onApprove={(id) =>
                  executeReportAction(id, 'RESOLVE', 'Скаргу успішно підтверджено')
                }
                onReject={(id) => executeReportAction(id, 'REJECT', 'Скаргу відхилено')}
                onBlockUser={(id) =>
                  executeReportAction(id, 'BLOCK_USER', 'Користувача заблоковано')
                }
                status={(report.status?.toUpperCase() || 'PENDING') as ModerationStatus}
                isPending={isActionLoading}
              />
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <p>Скарг на повідомлення не знайдено</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div
          className={styles.pagination}
          style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}
        >
          <button
            disabled={queryParams.page === 1}
            onClick={() => handleParamChange('page', (queryParams.page || 1) - 1)}
          >
            Назад
          </button>
          <span>
            Сторінка {queryParams.page} з {totalPages}
          </span>
          <button
            disabled={queryParams.page === totalPages}
            onClick={() => handleParamChange('page', (queryParams.page || 1) + 1)}
          >
            Вперед
          </button>
        </div>
      )}
    </div>
  );
};
