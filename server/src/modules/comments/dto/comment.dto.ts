import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'uuid-зданої-роботи' })
  @IsString()
  @IsNotEmpty()
  submissionId!: string;

  @ApiProperty({ example: 'Вибачте, я забув прикріпити другий файл. Можна я додам його зараз?' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}
