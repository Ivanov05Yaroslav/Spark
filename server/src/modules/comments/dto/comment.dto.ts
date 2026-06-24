import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
