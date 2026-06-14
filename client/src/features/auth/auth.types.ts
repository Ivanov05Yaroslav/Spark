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

export interface VerifyCodeRequest {
    sessionId: string;
    code: string;
}

export interface VerifyCodeResponse {
    message: string;
}

export interface ResetPasswordRequest {
    sessionId: string;
    newPassword: string;
}

export interface ResetPasswordResponse {
    message: string;
}

export interface ResendCodeRequest {
    sessionId: string;
}

export interface ResendCodeResponse {
    message?: string;
}