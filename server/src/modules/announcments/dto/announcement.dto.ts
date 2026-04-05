import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'uuid-курсу' })
  @IsString()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty({ example: 'Увага! Завтра контрольна робота' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Повторіть параграфи 5-7. Контрольна буде у форматі тесту.' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class UpdateAnnouncementDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;
}
