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
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
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

  @ApiProperty({
    example: 'Вступ до геометрії',
    required: false,
    description: 'Назва нового модуля, якщо його потрібно створити разом із тестом',
  })
  @IsOptional()
  @IsString()
  newModuleTitle?: string;

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

  @ApiProperty({ example: false, description: 'Чи прихований загальний бал' })
  @IsOptional()
  @IsBoolean()
  isResultHidden?: boolean;

  @ApiProperty({ example: false, description: 'Чи заборонено учню переглядати свою спробу' })
  @IsOptional()
  @IsBoolean()
  isAttemptHidden?: boolean;

  @ApiProperty({
    example: true,
    description: 'Чи показувати учню, де він помилився під час перегляду',
  })
  @IsOptional()
  @IsBoolean()
  isShowCorrectAnswers?: boolean;

  @ApiProperty({ example: false, description: 'Перемішувати питання' })
  @IsOptional()
  @IsBoolean()
  isShuffleQuestions?: boolean;

  @ApiProperty({ example: false, description: 'Перемішувати відповіді всередині питань' })
  @IsOptional()
  @IsBoolean()
  isShuffleAnswers?: boolean;

  @ApiProperty({ example: false, description: 'Приховати сам тест' })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @ApiProperty({
    type: [CreateQuestionDto],
    description: 'Масив питань, які будуть створені одразу з тестом',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}

export class UpdateAnswerDto {
  @ApiProperty({
    example: 'uuid-відповіді',
    required: false,
    description: 'Якщо немає - буде створено нову',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'Київ' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isCorrect!: boolean;
}

export class UpsertQuestionDto {
  @ApiProperty({
    example: 'uuid-питання',
    required: false,
    description: 'Якщо немає - буде створено нове',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ enum: QuestionType })
  @IsEnum(QuestionType)
  type!: QuestionType;

  @ApiProperty({ example: 'Яке місто є столицею України?' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @Min(0.1)
  points!: number;

  @ApiProperty({ type: [UpdateAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAnswerDto)
  answers!: UpdateAnswerDto[];
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

  @ApiProperty({
    example: 'Нова назва модуля',
    required: false,
    description: 'Нова назва модуля курсу',
  })
  @IsOptional()
  @IsString()
  newModuleTitle?: string;

  @ApiProperty({ example: 'Назва тесту', required: false, description: 'Назва тесту' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 60,
    required: false,
    description: 'Ліміт часу на проходження тесту (у хвилинах)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitMinutes?: number;

  @ApiProperty({
    example: '2026-12-31T23:59:59Z',
    required: false,
    description: 'Дата завершення тесту',
  })
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiProperty({
    example: 3,
    required: false,
    description: 'Максимальна кількість спроб проходження тесту',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttempts?: number;

  @ApiProperty({ example: false, description: 'Чи прихований загальний бал' })
  @IsOptional()
  @IsBoolean()
  isResultHidden?: boolean;

  @ApiProperty({ example: false, description: 'Чи заборонено учню переглядати свою спробу' })
  @IsOptional()
  @IsBoolean()
  isAttemptHidden?: boolean;

  @ApiProperty({
    example: true,
    description: 'Чи показувати учню, де він помилився під час перегляду',
  })
  @IsOptional()
  @IsBoolean()
  isShowCorrectAnswers?: boolean;

  @ApiProperty({ example: false, description: 'Перемішувати питання' })
  @IsOptional()
  @IsBoolean()
  isShuffleQuestions?: boolean;

  @ApiProperty({ example: false, description: 'Перемішувати відповіді всередині питань' })
  @IsOptional()
  @IsBoolean()
  isShuffleAnswers?: boolean;

  @ApiProperty({ example: false, required: false, description: 'Чи прихований тест' })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @ApiProperty({
    type: [UpsertQuestionDto],
    description:
      'Масив поточних питань. Питання/відповіді з id будуть оновлені, без id - створені. Ті, що відсутні в масиві, будуть видалені з бази.',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertQuestionDto)
  questions?: UpsertQuestionDto[];
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
