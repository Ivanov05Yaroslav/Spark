import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Іван', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Ім'я не може бути порожнім" })
  firstName?: string;

  @ApiProperty({ example: 'Іванович', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'По батькові не може бути порожнім' })
  middleName?: string;

  @ApiProperty({ example: 'Петренко', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Прізвище не може бути порожнім' })
  lastName?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Аватар користувача',
    required: false,
  })
  file?: any;
}
