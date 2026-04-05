import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdminCreateUserDto {
  @ApiProperty({ example: 'student@school.com' })
  @IsEmail()
  email!: string;

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

  @ApiProperty({ example: 'STUDENT', description: 'STUDENT, TEACHER або MODERATOR' })
  @IsString()
  @IsNotEmpty()
  roleName!: string;

  @ApiProperty({ example: '10-А', description: "Клас (Обов'язково для учнів)", required: false })
  @IsOptional()
  @IsString()
  className?: string;

  @ApiProperty({ example: '5-Б', description: 'Клас, де вчитель є керівником', required: false })
  @IsOptional()
  @IsString()
  isHomeroomFor?: string;

  @ApiProperty({
    example: ['Математика', 'Алгебра'],
    description: 'Предмети вчителя',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjectNames?: string[];
}

export class BulkImportUsersDto {
  @ApiProperty({ type: [AdminCreateUserDto], description: 'Масив користувачів для імпорту' })
  @IsArray()
  users!: AdminCreateUserDto[];
}
