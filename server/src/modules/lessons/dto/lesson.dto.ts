import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ example: 'uuid-course' })
  @IsString()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty({ required: false, description: 'ID існуючого модуля (теми)' })
  @IsOptional()
  @IsString()
  courseModuleId?: string;

  @ApiProperty({
    required: false,
    description: 'Назва нового модуля (теми), якщо створюється новий',
  })
  @IsOptional()
  @IsString()
  newModuleTitle?: string;

  @ApiProperty({ example: 'Вступ до геометрії' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ required: false, description: 'Опис уроку' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-09-01T10:00:00Z', description: 'Дата та час уроку' })
  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ required: false, type: [String], description: 'Масив ID груп НУШ' })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string')
      return value
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);
    if (Array.isArray(value)) return value;
    return [];
  })
  @IsArray()
  @IsString({ each: true })
  nusGroupIds?: string[];
}

export class UpdateLessonDto {
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
  @IsDateString()
  date?: string;

  @ApiProperty({ required: false, description: 'ID нового модуля (теми)' })
  @IsOptional()
  @IsString()
  courseModuleId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string')
      return value
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);
    if (Array.isArray(value)) return value;
    return [];
  })
  @IsArray()
  @IsString({ each: true })
  nusGroupIds?: string[];
}
