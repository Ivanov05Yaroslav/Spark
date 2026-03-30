import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Іван', description: "Ім'я", required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Іванович', description: 'По-батькові', required: false })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ example: 'Іванов', description: 'Прізвище', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ 
    example: 'https://i.pinimg.com/1200x/26/44/1c/26441c19f3dfa3815a6d79f0fe663dae.jpg', 
    description: 'Посилання на аватар (URL)', 
    required: false 
  })
  @IsOptional()
  @IsUrl({}, { message: 'Аватар має бути дійсним URL посиланням' })
  avatarUrl?: string;
}