export interface SchoolDTO {
  id: string;
  name: string;
  fullName: string;
  city: string;
  address: string;
}

export interface UserProfileResponseDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  avatarUrl: string | null;
  school: SchoolDTO | null;
  roles: string[];
  homeroomClasses: any[];
  subjects: string[];
}
