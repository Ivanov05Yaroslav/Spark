export interface CreateManualUserPayload {
  schoolId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  roles: string[];
  classId?: string;
  subjectIds?: string[];
}

export interface ManagedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  avatarUrl: string | null;
  createdAt: string;
  roles: string[];
}

export interface GetUsersResponse {
  data: ManagedUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
