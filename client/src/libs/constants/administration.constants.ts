export const TABS_ITEMS = [
  { id: 'user-management', label: 'Керування користувачами' },
  { id: 'role-management', label: 'Керування ролями' },
  { id: 'messages-moderation', label: 'Модерація повідомлень' },
  { id: 'school-management', label: 'Керування заявками' },
];

export const STATUS = [
  { id: '', label: 'Усі' },
  { id: 'PENDING', label: 'Очікує розгляду' },
  { id: 'RESOLVED', label: 'Вирішено' },
  { id: 'REJECTED', label: 'Відхилено' },
  { id: 'BLOCKED', label: 'Заблоковано' },
];

export const MODERATION_SORT_BY = [{ id: 'createdAt', label: 'Дата створення' }];

export const DOC_NAMES = [
  { id: 'passportDocs', label: 'Паспорт громадянина України' },
  { id: 'edrDocs', label: 'Витяг з ЄДР' },
  { id: 'appointmentOrderDocs', label: 'Наказ про призначення' },
  { id: 'employmentContractDocs', label: 'Трудовий контракт' },
];
