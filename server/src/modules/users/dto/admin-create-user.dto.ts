import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminCreateUserDto {
  @ApiProperty({ example: 'student@school.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8, { message: 'Пароль має містити щонайменше 8 символів' })
  password!: string;

  @ApiProperty({ example: 'Іван' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Іванов' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: 'Іванович', required: false })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ example: ['STUDENT'], description: 'Масив ролей (STUDENT, TEACHER, MODERATOR)' })
  @IsArray()
  @IsString({ each: true })
  roles!: string[];

  @ApiProperty({ example: 'uuid-школи', required: false })
  @IsOptional()
  @IsString()
  schoolId?: string;

  @ApiProperty({ example: '10-Б', description: "Клас (Обов'язково для учнів)", required: false })
  @IsOptional()
  @IsString()
  className?: string;

  @ApiProperty({ example: '5-Б', description: 'Клас, де вчитель є керівником', required: false })
  @IsOptional()
  @IsString()
  homeroomClassName?: string;

  @ApiProperty({
    example: ['Математика', 'Алгебра'],
    description: 'Предмети (Обовʼязково для вчителів)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];
}

export class BulkImportUsersDto {
  @ApiProperty({ type: [AdminCreateUserDto], description: 'Масив користувачів для імпорту' })
  @IsArray()
  users!: AdminCreateUserDto[];
}
