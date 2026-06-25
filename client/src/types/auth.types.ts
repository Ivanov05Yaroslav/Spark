export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  avatarUrl: string;
  lastLoginAt: string;
  roles: string[];
  schoolId: string | null;
  children: Child[];
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  sessionId: string;
  message: string;
}

export interface ResetPasswordRequest {
  sessionId: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ParentInitRequest {
  childrenCodes: string[];
}

export interface ParentInitResponse {
  message: string;
  sessionId: string;
}

export interface ParentDetailsRequest {
  sessionId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
}

export interface ParentDetailsResponse {
  message: string;
  sessionId: string;
}

export interface VerifyCodeRequest {
  sessionId: string;
  code: string;
}

export interface VerifyCodeResponse {
  message: string;
  sessionId?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

export interface ResendCodeRequest {
  sessionId: string;
}

export interface ResendCodeResponse {
  message?: string;
}

export type RegionsResponseDto = string[];

export type CitiesResponseDto = string[];

export interface SchoolDto {
  edeboId: string;
  fullName: string;
}

export type SchoolsResponseDto = SchoolDto[];

export interface InitSchoolRegistrationRequest {
  edeboId: string;
}

export interface InitSchoolRegistrationResponse {
  statusCode?: number;
  message?: string;
  sessionId: string;
}

export interface SchoolDetailsRequest {
  sessionId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
}

export interface SchoolDetailsResponse {
  message: string;
  sessionId: string;
}

export interface SubmitSchoolDocsRequestDTO {
  sessionId: string;
  passportDocs: File[];
  edrDocs?: File[];
  appointmentOrderDocs?: File[];
  employmentContractDocs?: File[];
}

export interface SubmitSchoolDocsResponseDTO {
  message?: string;
}
