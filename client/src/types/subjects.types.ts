export interface SubjectDTO {
    id: string;
    name: string;
}

export interface MySubjectsResponseDTO {
    subjects: SubjectDTO[];
}

export interface NushGradingGroupDto {
    id: number;
    name: string;
    subjectId: number;
}