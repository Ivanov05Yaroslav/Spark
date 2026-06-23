import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'uuid-курсу' })
  @IsString()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty({ example: 'Домашнє завдання №1: Дроби' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-05-20T23:59:59.000Z', required: false })
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiProperty({
    example: 'uuid-nus-group',
    description: 'Група результатів для класів НУШ',
    required: false,
  })
  @IsOptional()
  @IsString()
  nusGroupId?: string;

  @ApiProperty({ example: 'uuid-модуля', required: false, description: 'ID теми/модуля курсу' })
  @IsOptional()
  @IsString()
  courseModuleId?: string;

  @ApiProperty({
    example: 'Вступ до геометрії',
    required: false,
    description: 'Назва нового модуля, якщо його потрібно створити разом із завданням',
  })
  @IsOptional()
  @IsString()
  newModuleTitle?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isHidden?: boolean;

  @ApiProperty({
    example: ['https://youtube.com/watch?v=123'],
    description: 'Масив посилань',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (value === '' || value === '[]') return [];
    if (
      value === 'string' ||
      (Array.isArray(value) && value.length === 1 && value[0] === 'string')
    ) {
      return [];
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    if (Array.isArray(value)) return value;
    return undefined;
  })
  @IsArray()
  @IsString({ each: true })
  links?: string[];

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Файли-вкладення',
    required: false,
  })
  files?: any[];
}

export class UpdateTaskDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nusGroupId?: string;

  @ApiProperty({ example: 'uuid-модуля', required: false, description: 'ID теми/модуля курсу' })
  @IsOptional()
  @IsString()
  courseModuleId?: string;

  @ApiProperty({
    example: 'Повторення матеріалу',
    required: false,
    description:
      'Назва нового модуля, якщо його потрібно створити прямо під час редагування завдання',
  })
  @IsOptional()
  @IsString()
  newModuleTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isHidden?: boolean;

  @ApiProperty({
    required: false,
    description: 'Масив URL існуючих файлів/посилань, які треба залишити',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (value === '' || value === '[]') return [];
    if (
      value === 'string' ||
      (Array.isArray(value) && value.length === 1 && value[0] === 'string')
    ) {
      return [];
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    if (Array.isArray(value)) return value;
    return undefined;
  })
  @IsArray()
  @IsString({ each: true })
  retainedAttachments?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (value === '' || value === '[]') return [];
    if (
      value === 'string' ||
      (Array.isArray(value) && value.length === 1 && value[0] === 'string')
    ) {
      return [];
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    if (Array.isArray(value)) return value;
    return undefined;
  })
  @IsArray()
  @IsString({ each: true })
  links?: string[];
}
