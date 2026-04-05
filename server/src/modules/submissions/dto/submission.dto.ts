import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskSubmissionDto {
  @ApiProperty({ example: 'uuid-завдання' })
  @IsString()
  @IsNotEmpty()
  taskId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === '') return undefined;
    if (value === 'string' || (Array.isArray(value) && value.length === 1 && value[0] === 'string'))
      return undefined;
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value;
    return undefined;
  })
  @IsArray()
  @IsString({ each: true })
  links?: string[];
}

export class UpdateTaskSubmissionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === '') return undefined;
    if (value === 'string' || (Array.isArray(value) && value.length === 1 && value[0] === 'string'))
      return undefined;
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value;
    return undefined;
  })
  @IsArray()
  @IsString({ each: true })
  retainedAttachments?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === '') return undefined;
    if (value === 'string' || (Array.isArray(value) && value.length === 1 && value[0] === 'string'))
      return undefined;
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value;
    return undefined;
  })
  @IsArray()
  @IsString({ each: true })
  links?: string[];
}

export class GradeSubmissionDto {
  @ApiProperty({ example: '12', description: 'Оцінка (Рівень або Бали)', required: false })
  @IsOptional()
  @IsString()
  score?: string;
}
