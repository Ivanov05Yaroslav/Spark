import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'uuid-предмету' })
  @IsString()
  @IsNotEmpty()
  subjectId!: string;

  @ApiProperty({ example: 'uuid-класу' })
  @IsString()
  @IsNotEmpty()
  classId!: string;

  @ApiProperty({ example: '2026-2027', description: 'Навчальний рік' })
  @IsString()
  @IsNotEmpty()
  academicYear!: string;

  @ApiProperty({
    example: 'Група 1 (Англійська)',
    description: 'Опціональна назва для підгрупи',
    required: false,
  })
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiProperty({
    example: ['uuid-вчителя2'],
    description: 'ID інших вчителів-співвикладачів',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coTeacherIds?: string[];
}

export class UpdateCourseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiProperty({ example: true, description: 'Перемістити в архів', required: false })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}

export class CoTeacherDto {
  @ApiProperty({ example: 'uuid-вчителя', description: 'ID вчителя для додавання у співвикладачі' })
  @IsString()
  @IsNotEmpty()
  teacherId!: string;
}

export enum CourseFilter {
  ALL = 'ALL',
  IN_PROGRESS = 'IN_PROGRESS',
  PLANNED = 'PLANNED',
  PAST = 'PAST',
  ARCHIVED = 'ARCHIVED',
}

export enum CourseSortBy {
  NAME = 'NAME',
  ACADEMIC_YEAR = 'ACADEMIC_YEAR',
}

export class GetCoursesQueryDto {
  @ApiProperty({ required: false, description: 'Пошук за предметом, класом або назвою групи' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: CourseFilter, default: CourseFilter.ALL })
  @IsOptional()
  @IsEnum(CourseFilter)
  filter?: CourseFilter = CourseFilter.ALL;

  @ApiProperty({ required: false, enum: CourseSortBy, default: CourseSortBy.ACADEMIC_YEAR })
  @IsOptional()
  @IsEnum(CourseSortBy)
  sortBy?: CourseSortBy = CourseSortBy.ACADEMIC_YEAR;

  @ApiProperty({ required: false, enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
