import {User} from "@/types/registration.types.ts";

export type RegionsResponseDto = string[]; //

export type CitiesResponseDto = string[]; //

export interface SchoolDto {
    edeboId: string;
    fullName: string;
}
export type SchoolsResponseDto = SchoolDto[]; //

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

export interface VerifyCodeRequest {
    sessionId: string;
    code: string;
}

export interface VerifyCodeResponse {
    message: string;
    sessionId: string;
}

export interface ResendCodeRequest {
    sessionId: string;
}

export interface ResendCodeResponse {
    message?: string;
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