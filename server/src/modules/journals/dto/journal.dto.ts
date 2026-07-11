import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export enum AttendanceMarkDto {
  ABSENT = 'Н',
  SICK = 'ХВ',
}

export class LessonGradeInputDto {
  @ApiPropertyOptional({
    nullable: true,
    description: 'ID групи НУШ. Якщо null — використовується для загальної/традиційної оцінки.',
  })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  nusGroupId?: string | null;

  @ApiProperty({
    nullable: true,
    example: 10,
    description: 'Оцінка 1-12. Якщо передати null — оцінка видаляється з клітинки.',
  })
  @ValidateIf((_, value) => value !== null)
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  score!: number | null;
}

export class LessonJournalStudentChangeDto {
  @ApiProperty({
    example: 'uuid-учня',
    description: 'ID учня, якому ставиться оцінка/відвідуваність',
  })
  @IsString()
  studentId!: string;

  @ApiPropertyOptional({
    enum: AttendanceMarkDto,
    nullable: true,
    description:
      'Н — відсутній, ХВ — хворів, null — був присутній (видалити "Н"). undefined — не змінювати.',
  })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsEnum(AttendanceMarkDto)
  attendance?: AttendanceMarkDto | null;

  @ApiPropertyOptional({
    type: [LessonGradeInputDto],
    description: 'Масив оцінок за роботу на уроці',
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonGradeInputDto)
  lessonGrades?: LessonGradeInputDto[];
}

export class SaveLessonJournalDto {
  @ApiProperty({ type: [LessonJournalStudentChangeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonJournalStudentChangeDto)
  changes!: LessonJournalStudentChangeDto[];
}

export class JournalSummaryQueryDto {
  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    maximum: 2,
    default: 1,
    description: 'Номер семестру',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2)
  semester: number = 1;
}
