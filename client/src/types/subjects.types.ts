interface SubjectDTO {
    id: string;
    name: string;
}

export interface MySubjectsResponseDTO {
    subjects: SubjectDTO[];
}