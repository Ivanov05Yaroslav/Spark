import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Іван', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Іванович', required: false })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ example: 'Петренко', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Аватар користувача',
    required: false,
  })
  file?: any;
}
