import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export enum QuestionType {
  ONE_CHOICE = 'ONE_CHOICE',
  // У майбутньому сюди можна додати:
  // MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  // TEXT = 'TEXT'
}

export class CreateTestDto {
  @ApiProperty({ example: 'uuid-курсу' })
  @IsString()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty({ example: 'uuid-nus-group', description: 'Група результатів НУШ', required: false })
  @IsOptional()
  @IsString()
  nusGroupId?: string;

  @ApiProperty({ example: 'uuid-модуля', required: false, description: 'ID теми/модуля курсу' })
  @IsOptional()
  @IsString()
  courseModuleId?: string;

  @ApiProperty({ example: 'Тест 1: Вступ до історії' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 45, description: 'Ліміт часу в хвилинах', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitMinutes?: number;

  @ApiProperty({ example: '2026-05-20T23:59:59.000Z', required: false })
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiProperty({ example: 1, description: 'Кількість спроб', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttempts?: number;

  @ApiProperty({
    example: false,
    description: 'Приховати результати/правильні відповіді від учнів після проходження',
  })
  @IsOptional()
  @IsBoolean()
  isResultHidden?: boolean;

  @ApiProperty({ example: false, description: 'Приховати сам тест (чорновик)' })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;
}

export class UpdateTestDto {
  @ApiProperty({ example: 'uuid-nus-group', description: 'Група результатів НУШ', required: false })
  @IsOptional()
  @IsString()
  nusGroupId?: string;

  @ApiProperty({ example: 'uuid-модуля', required: false, description: 'ID теми/модуля курсу' })
  @IsOptional()
  @IsString()
  courseModuleId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitMinutes?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttempts?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isResultHidden?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;
}

export class AnswerDto {
  @ApiProperty({ example: 'Київ' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ example: true, description: 'Чи є ця відповідь правильною' })
  @IsBoolean()
  isCorrect!: boolean;
}

export class CreateQuestionDto {
  @ApiProperty({ enum: QuestionType, example: QuestionType.ONE_CHOICE })
  @IsEnum(QuestionType)
  type!: QuestionType;

  @ApiProperty({ example: 'Яке місто є столицею України?' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ example: 2.5, description: 'Кількість балів за правильну відповідь' })
  @IsNumber()
  @Min(0.1)
  points!: number;

  @ApiProperty({ type: [AnswerDto], description: 'Варіанти відповідей' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers!: AnswerDto[];
}

export class BulkCreateQuestionDto {
  @ApiProperty({ type: [CreateQuestionDto], description: 'Масив питань для масового створення' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions!: CreateQuestionDto[];
}

export class UpdateQuestionDto {
  @ApiProperty({ enum: QuestionType, required: false })
  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @ApiProperty({ example: 'Яке місто є столицею України?', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ApiProperty({
    example: 2.5,
    description: 'Кількість балів за правильну відповідь',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  points?: number;

  @ApiProperty({
    type: [AnswerDto],
    description: 'Повністю новий масив варіантів відповідей',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers?: AnswerDto[];
}

export class AnswerSelectionDto {
  @ApiProperty({ example: 'uuid-питання' })
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @ApiProperty({ example: 'uuid-обраної-відповіді' })
  @IsString()
  @IsNotEmpty()
  answerId!: string;
}

export class SubmitTestDto {
  @ApiProperty({ type: [AnswerSelectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerSelectionDto)
  answers!: AnswerSelectionDto[];

  @ApiProperty({
    example: 120,
    description: 'Час, витрачений на проходження тесту (у секундах)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  duration?: number;
}
