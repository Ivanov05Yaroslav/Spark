export interface SchoolDTO {
  id: string;
  name: string;
  address: string;
}

export interface SubjectDTO {
  id: string;
  name: string;
}

export interface ClassDTO {
  id: string;
  name: string;
}

export interface ChildDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  avatarUrl: string | null;
  class?: ClassDTO;
  coursesCount: number;
  classmatesCount: number;
}

export interface UserProfileResponseDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  avatarUrl: string | null;
  roles: string[];
  createdAt: string;
  themePreference: string;
  school?: SchoolDTO;
  subjects?: SubjectDTO[];
  homeroomClass?: ClassDTO;
  class?: ClassDTO;
  children?: ChildDTO[];
  coursesCount?: number;
  classmatesCount?: number;
  parentsCode?: string | null;
}
