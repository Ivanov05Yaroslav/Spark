import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export enum CourseStatusFilter {
  ACTIVE = 'ACTIVE',
  PAST = 'PAST',
  UPCOMING = 'UPCOMING',
  ARCHIVED = 'ARCHIVED',
  HIDDEN = 'HIDDEN',
  ALL = 'ALL',
}

export enum CourseSortBy {
  NAME = 'NAME',
  START_DATE = 'START_DATE',
}

export enum CourseRoleContext {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

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
  @ApiProperty({
    example: 'Група 1',
    description: 'Назва групи, якщо курс ділиться',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    if (value === 'null' || value.trim() === '') return null;
    return value;
  })
  groupName?: string | null;

  @ApiProperty({ example: '#702DFF', required: false, description: 'Колір теми курсу' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    if (value === 'null' || value.trim() === '') return null;
    return value;
  })
  themeColor?: string | null;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Фонове зображення курсу',
  })
  @IsOptional()
  backgroundImage?: any;

  @ApiProperty({
    type: [String],
    required: false,
    description: 'Посилання на відеозустрічі (Zoom, Meet тощо)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    if (value === 'null' || value === '') return [];
    if (Array.isArray(value)) return value;
    return value
      .split(',')
      .map((link: string) => link.trim())
      .filter(Boolean);
  })
  @IsArray()
  @IsString({ each: true })
  videoLinks?: string[];

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
    if (value === undefined) return undefined;
    if (value === 'null' || value.trim() === '') return [];
    if (Array.isArray(value)) return value;
    return value
      .split(',')
      .map((id: string) => id.trim())
      .filter(Boolean);
  })
  @IsArray()
  @IsString({ each: true })
  coTeacherIds?: string[];

  @ApiProperty({ type: [String], required: false, description: 'ID вибраних учнів для підгрупи' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    if (value === 'null' || value.trim() === '') return [];
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

  @ApiProperty({
    example: 'Група 1',
    description: 'Назва групи, якщо курс ділиться',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    if (value === 'null' || value.trim() === '') return null;
    return value;
  })
  groupName?: string | null;

  @ApiProperty({ example: '#702DFF', required: false, description: 'Колір теми курсу' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    if (value === 'null' || value.trim() === '') return null;
    return value;
  })
  themeColor?: string | null;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Нове фонове зображення курсу',
  })
  @IsOptional()
  backgroundImage?: any;

  @ApiProperty({
    type: [String],
    required: false,
    description: 'Посилання на відеозустрічі (Zoom, Meet тощо)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    if (value === 'null' || value === '') return [];
    if (Array.isArray(value)) return value;
    return value
      .split(',')
      .map((link: string) => link.trim())
      .filter(Boolean);
  })
  @IsArray()
  @IsString({ each: true })
  videoLinks?: string[];

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
    if (value === undefined) return undefined;
    if (value === 'null' || value.trim() === '') return [];
    if (Array.isArray(value)) return value;
    return value
      .split(',')
      .map((id: string) => id.trim())
      .filter(Boolean);
  })
  @IsArray()
  @IsString({ each: true })
  coTeacherIds?: string[];

  @ApiProperty({ type: [String], required: false, description: 'ID вибраних учнів для підгрупи' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    if (value === 'null' || value.trim() === '') return [];
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

export class CreateCourseModuleDto {
  @ApiProperty({ example: 'Вступ до алгебри', description: 'Назва теми/модуля' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: 2, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2)
  semester: number = 1;
}

export class UpdateCourseModuleDto {
  @ApiProperty({ example: 'Вступ до геометрії', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: 2, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2)
  semester?: number;
}

export class CoTeacherDto {
  @ApiProperty({ example: 'uuid-вчителя', description: 'ID вчителя для додавання у співвикладачі' })
  @IsString()
  @IsNotEmpty()
  teacherId!: string;
}

export class GetCoursesQueryDto {
  @ApiProperty({ required: false, description: 'Пошук за предметом, класом або назвою' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    enum: CourseStatusFilter,
    description:
      'Фільтр за статусом (ACTIVE - в процесі, ARCHIVED - архівні, PAST - пройдені, UPCOMING - майбутні, HIDDEN - сховані, ALL - всі)',
    default: CourseStatusFilter.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CourseStatusFilter)
  filter?: CourseStatusFilter = CourseStatusFilter.ACTIVE;

  @ApiProperty({ required: false, enum: CourseSortBy, default: CourseSortBy.START_DATE })
  @IsOptional()
  @IsEnum(CourseSortBy)
  sortBy?: CourseSortBy;

  @ApiProperty({ required: false, enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({
    required: false,
    enum: CourseRoleContext,
    description: 'Контекст ролі для отримання курсів',
  })
  @IsOptional()
  @IsEnum(CourseRoleContext)
  roleContext?: CourseRoleContext;

  @ApiProperty({
    required: false,
    description: 'ID дитини (використовується тільки якщо roleContext = PARENT)',
  })
  @IsOptional()
  @IsString()
  childId?: string;

  @ApiProperty({
    required: false,
    description: 'Показувати тільки курси створені мною (для TEACHER)',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isCreator?: boolean;

  @ApiProperty({ required: false, description: 'Номер сторінки (за замовчуванням 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    required: false,
    description: 'Кількість елементів на сторінку (за замовчуванням 8)',
    default: 8,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 8;
}

export class UpdateVideoLinksDto {
  @ApiProperty({
    example: ['https://zoom.us/j/123456789', 'https://meet.google.com/abc'],
    description:
      'Актуальний масив посилань. Для видалення/зміни/додавання просто передайте повністю новий масив.',
  })
  @IsArray()
  @IsString({ each: true })
  videoLinks!: string[];
}
