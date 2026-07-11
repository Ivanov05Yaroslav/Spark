import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
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

  @ApiProperty({
    required: false,
    description: 'Група НУШ для оцінювання цього конкретного питання',
  })
  @IsOptional()
  @IsString()
  nusGroupId?: string;

  @ApiProperty({ type: [AnswerDto], description: 'Масив відповідей до питання' })
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

  @ApiProperty({ example: 'uuid-lesson', description: "ID уроку, до якого прив'язано тест" })
  @IsString()
  @IsNotEmpty()
  lessonId!: string;

  @ApiProperty({ example: 'Підсумковий тест з геометрії' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 45, required: false, description: 'Час на виконання у хвилинах' })
  @IsOptional()
  @IsNumber()
  timeLimitMinutes?: number;

  @ApiProperty({ example: '2026-05-20T23:59:59.000Z', required: false })
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiProperty({ example: 1, required: false, description: 'Кількість спроб (за замовчуванням 1)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAttempts?: number;

  @ApiProperty({ example: false, description: 'Приховати результати після завершення' })
  @IsOptional()
  @IsBoolean()
  isResultHidden?: boolean;

  @ApiProperty({ example: false, description: 'Приховати використання спроби' })
  @IsOptional()
  @IsBoolean()
  isAttemptHidden?: boolean;

  @ApiProperty({ example: true, description: 'Показувати правильні відповіді після тесту' })
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

  @ApiProperty({ type: [CreateQuestionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}

export class UpsertAnswerDto extends AnswerDto {
  @ApiProperty({ required: false, description: 'ID існуючої відповіді (для оновлення)' })
  @IsOptional()
  @IsString()
  id?: string;
}

export class UpsertQuestionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ enum: QuestionType })
  @IsEnum(QuestionType)
  type!: QuestionType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.1)
  points!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nusGroupId?: string;

  @ApiProperty({ type: [UpsertAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertAnswerDto)
  answers!: UpsertAnswerDto[];
}

export class UpdateTestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  timeLimitMinutes?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAttempts?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isResultHidden?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAttemptHidden?: boolean;

  @ApiProperty({ required: false })
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
      'Масив поточних питань. Питання/відповіді з id будуть оновлені, без id - створені. Ті, що відсутні в масиві, будуть видалені.',
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
  @ApiProperty({
    description: 'Об`єкт, де ключ - id питання, значення - масив id обраних відповідей',
    example: { 'question-id-1': ['answer-id-1'], 'question-id-2': ['answer-id-3', 'answer-id-4'] },
  })
  @IsNotEmpty()
  answers!: Record<string, string[]>;

  @ApiProperty({ required: false, description: 'Час виконання тесту в секундах' })
  @IsOptional()
  @IsNumber()
  duration?: number;
}