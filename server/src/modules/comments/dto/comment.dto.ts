import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Я не зрозумів умову завдання' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ example: 'uuid-завдання', required: false })
  @IsOptional()
  @IsString()
  taskId?: string;

  @ApiProperty({ example: 'uuid-тесту', required: false })
  @IsOptional()
  @IsString()
  testId?: string;

  @ApiProperty({
    example: 'uuid-учня',
    required: false,
    description:
      "Обов'язково для вчителя! Вказує, в чию приватну гілку йде повідомлення. Учням передавати не треба (підставиться їхній ID).",
  })
  @IsOptional()
  @IsString()
  targetStudentId?: string;
}

export class UpdateCommentDto {
  @ApiProperty({ example: 'Оновлений текст коментаря' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class ReportCommentDto {
  @ApiProperty({ example: 'Ненормативна лексика', description: 'Причина скарги' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export enum ReportAction {
  RESOLVE = 'RESOLVE',
  REJECT = 'REJECT',
  BLOCK = 'BLOCK',
}

export class ResolveReportDto {
  @ApiProperty({ enum: ReportAction, example: ReportAction.RESOLVE })
  @IsEnum(ReportAction)
  action!: ReportAction;
}

export class GetReportsQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Пошук за причиною скарги або текстом коментаря' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    enum: ['PENDING', 'RESOLVED', 'REJECTED', 'BLOCKED'],
    description: 'Фільтр за статусом',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, enum: ['createdAt'], default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ required: false, enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
