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
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface ResendCodeRequest {
    sessionId: string;
}

export interface ResendCodeResponse {
    message?: string;
}

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