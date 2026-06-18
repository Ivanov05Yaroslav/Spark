import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'uuid-предмету' })
  @IsUUID()
  @IsNotEmpty()
  subjectId!: string;

  @ApiProperty({ example: 'uuid-класу' })
  @IsUUID()
  @IsNotEmpty()
  classId!: string;

  @ApiProperty({ example: '2026-09-01T00:00:00Z', description: 'Дата початку курсу (ISO)' })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({ example: '2027-05-31T23:59:59Z', description: 'Дата закінчення курсу (ISO)' })
  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @ApiProperty({
    example: 'Група 1',
    description: 'Назва групи (Група 1 або Група 2), якщо курс ділиться',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value && value.trim() !== '' && value !== 'null' ? value : undefined))
  @IsString()
  groupName?: string;

  @ApiProperty({ example: '#702DFF', required: false, description: 'Колір теми курсу' })
  @IsOptional()
  @Transform(({ value }) => (value && value.trim() !== '' && value !== 'null' ? value : undefined))
  @IsString()
  themeColor?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Фонове зображення курсу',
  })
  @IsOptional()
  backgroundImage?: any;

  @ApiProperty({ example: false, description: 'Приховати курс від учнів', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isHidden?: boolean;

  @ApiProperty({ type: [String], required: false, description: 'ID інших вчителів-співвикладачів' })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === 'null' || value === 'undefined' || value.trim() === '')
      return undefined;
    if (Array.isArray(value)) return value;
    return value
      .split(',')
      .map((id: string) => id.trim())
      .filter(Boolean);
  })
  @IsArray()
  @IsString({ each: true })
  coTeacherIds?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    description: 'ID вибраних учнів для формування підгрупи',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === 'null' || value === 'undefined' || value.trim() === '')
      return undefined;
    if (Array.isArray(value)) return value;
    return value
      .split(',')
      .map((id: string) => id.trim())
      .filter(Boolean);
  })
  @IsArray()
  @IsString({ each: true })
  studentIds?: string[];
}

export class UpdateCourseDto {
  @ApiProperty({
    example: '2026-09-01T00:00:00Z',
    description: 'Дата початку курсу',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2027-05-31T23:59:59Z',
    description: 'Дата закінчення курсу',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 'Група 2', required: false, description: 'Назва групи' })
  @IsOptional()
  @Transform(({ value }) => (value && value.trim() !== '' && value !== 'null' ? value : undefined))
  @IsString()
  groupName?: string;

  @ApiProperty({ example: '#33FF57', required: false, description: 'Колір теми курсу' })
  @IsOptional()
  @Transform(({ value }) => (value && value.trim() !== '' && value !== 'null' ? value : undefined))
  @IsString()
  themeColor?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Нове фонове зображення курсу',
  })
  @IsOptional()
  backgroundImage?: any;

  @ApiProperty({ example: true, description: 'Приховати курс від учнів', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isHidden?: boolean;

  @ApiProperty({ example: true, description: 'Перемістити в архів', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isArchived?: boolean;

  @ApiProperty({ type: [String], required: false, description: 'ID інших вчителів-співвикладачів' })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === 'null' || value === 'undefined' || value.trim() === '')
      return undefined;
    if (Array.isArray(value)) return value;
    return value
      .split(',')
      .map((id: string) => id.trim())
      .filter(Boolean);
  })
  @IsArray()
  @IsString({ each: true })
  coTeacherIds?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    description: 'ID вибраних учнів для формування підгрупи',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === 'null' || value === 'undefined' || value.trim() === '')
      return undefined;
    if (Array.isArray(value)) return value;
    return value
      .split(',')
      .map((id: string) => id.trim())
      .filter(Boolean);
  })
  @IsArray()
  @IsString({ each: true })
  studentIds?: string[];
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
  START_DATE = 'START_DATE',
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

  @ApiProperty({ required: false, enum: CourseSortBy, default: CourseSortBy.START_DATE })
  @IsOptional()
  @IsEnum(CourseSortBy)
  sortBy?: CourseSortBy = CourseSortBy.START_DATE;

  @ApiProperty({ required: false, enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
