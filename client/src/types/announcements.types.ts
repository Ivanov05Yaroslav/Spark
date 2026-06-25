export interface CreateAnnouncementDto {
  courseId: string;
  title: string;
  content: string;
}

export interface AnnouncementCreatorDto {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface AnnouncementResponseDto {
  id: string;
  courseId: string;
  creatorId: string;
  title: string;
  content: string;
  createdAt: string;
  creator: AnnouncementCreatorDto;
}
