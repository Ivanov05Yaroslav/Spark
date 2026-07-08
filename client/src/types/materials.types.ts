export interface CreateLinkMaterialDto {
  courseId: string;
  title: string;
  courseModuleId?: string;
  newModuleTitle?: string;
  linkUrl: string;
  isHidden: boolean;
}

export interface UpdateLinkMaterialDto {
  title?: string;
  linkUrl?: string;
  courseModuleId?: string;
  newModuleTitle?: string;
  isHidden?: boolean;
}

export interface LinkMaterialResponseDto {
  id: string;
  title: string;
  linkUrl: string;
  courseModuleId: string;
  isHidden: boolean;
}
