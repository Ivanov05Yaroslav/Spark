import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetSubmissionsQueryDto {
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

  @ApiProperty({ required: false, description: "Пошук за прізвищем або ім'ям учня" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    description: 'Тільки перевірені (true) або тільки неперевірені (false)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isGraded?: boolean;

  @ApiProperty({ required: false, enum: ['submittedAt', 'score'], default: 'submittedAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'submittedAt';

  @ApiProperty({ required: false, enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
