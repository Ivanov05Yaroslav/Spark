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

export interface ModerationUserDto {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  roles: string[];
  avatarUrl?: string | null;
}

export interface BackendCommentDto {
  id: string;
  content: string;
  createdAt: string;
}

export interface ResolveReportPayload {
  action: string;
}

export interface CommentReportDto {
  id: string;
  reporterId: string;
  reportedUserId: string;
  commentId: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
  reporter: ModerationUserDto;
  reportedUser: ModerationUserDto;
  comment: BackendCommentDto;
}

export interface CommentReportsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CommentReportsResponseDto {
  data: CommentReportDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SchoolRequestDto {
  id: string;
  edeboId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  passportDocs: string[];
  edrDocs: string[];
  appointmentOrderDocs: string[];
  employmentContractDocs: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface SchoolDetailsDto {
  id: string;
  edeboId: string;
  fullName: string;
  shortName: string;
  isChecked: string;
  status: string;
  institutionType: string;
  financingType: string;
  koatuuId: string;
  region: string;
  koatuuName: string;
  address: string;
  katottgCode: string;
  katottgName: string;
  parentInstitutionId: string | null;
  governanceName: string;
  phone: string;
  fax: string;
  email: string;
  website: string;
  directorFullName: string;
  isSupport: string;
  isVillage: string;
  isMountain: string;
  isInternat: string;
  approvedCount: number | null;
  city: string;
  updatedAt: string;
}
