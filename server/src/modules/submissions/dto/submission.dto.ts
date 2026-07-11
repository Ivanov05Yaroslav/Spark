import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateTaskSubmissionDto {
  @ApiProperty({ example: 'uuid-завдання' })
  @IsString()
  @IsNotEmpty()
  taskId!: string;

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

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Файли-вкладення',
    required: false,
  })
  files?: any[];
}

export class UpdateTaskSubmissionDto {
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

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Нові файли-вкладення',
    required: false,
  })
  files?: any[];
}

export class GradeNusDto {
  @ApiProperty({ required: false, description: 'ID групи НУШ (якщо є)' })
  @IsOptional()
  @IsString()
  nusGroupId?: string;

  @ApiProperty({ description: 'Оцінка за 12-бальною шкалою' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  score!: number;
}

export class GradeSubmissionDto {
  @ApiProperty({
    example: '12',
    description: 'Загальна оцінка за 12-бальною шкалою',
    required: false,
  })
  @IsOptional()
  @IsString()
  score?: string;

  @ApiProperty({
    type: [GradeNusDto],
    required: false,
    description: 'Оцінки по групах НУШ',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeNusDto)
  nusGrades?: GradeNusDto[];
}
