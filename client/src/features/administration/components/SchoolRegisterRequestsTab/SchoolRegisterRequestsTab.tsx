import React from 'react';
import {
  SchoolRegistrationRequestCard,
  AttachedDocument,
} from '@/components/administration/SchoolRegistrationRequestCard/SchoolRegistrationRequestCard.tsx';
import { useSchoolRequests } from '@/features/administration/hooks/useSchoolRequests.ts';
import styles from './SchoolRegisterRequestsTab.module.css';

export const SchoolRegisterRequestsTab = () => {
  const { requests, isLoading, isActionLoading, executeAction } = useSchoolRequests();

  const getFileNameFromUrl = (url: string) => {
    const cleanUrl = url.split('?')[0];
    const parts = cleanUrl.split('/');
    return parts[parts.length - 1] || 'document.png';
  };

  const mapDocuments = (request: any): AttachedDocument[] => {
    const docs: AttachedDocument[] = [];

    const addDocs = (urls: string[], docTypeLabel: string) => {
      if (!urls || urls.length === 0) return;
      urls.forEach((url, idx) => {
        docs.push({
          id: `${docTypeLabel}-${idx}-${request.id}`,
          fileName: `${docTypeLabel} - ${getFileNameFromUrl(url)}`,
          fileUrl: url,
        });
      });
    };

    addDocs(request.passportDocs, 'Паспорт');
    addDocs(request.edrDocs, 'Виписка ЄДР');
    addDocs(request.appointmentOrderDocs, 'Наказ');
    addDocs(request.employmentContractDocs, 'Трудовий договір');

    return docs;
  };

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {isLoading ? (
          <div className={styles.loadingState}>Завантаження заявок...</div>
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <SchoolRegistrationRequestCard
              key={request.id}
              id={request.id}
              applicant={{
                firstName: request.firstName,
                lastName: request.lastName,
                middleName: request.middleName,
              }}
              schoolName={request.schoolName || `Заклад з ЄДЕБО №${request.edeboId}`}
              schoolAddress={request.schoolAddress || `Email: ${request.email}`}
              edboNumber={request.edeboId}
              documents={mapDocuments(request)}
              onApprove={(id) => executeAction(id, 'APPROVE')}
              onReject={(id, reason) => executeAction(id, 'REJECT', reason)}
              status={request.status as any}
              isPending={isActionLoading}
            />
          ))
        ) : (
          <div className={styles.emptyState}>Нових заявок на реєстрацію не знайдено</div>
        )}
      </div>
    </div>
  );
};
