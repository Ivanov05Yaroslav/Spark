import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

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

export class GetSchoolUsersDto {
  @ApiProperty({ required: false, description: 'Номер сторінки (за замовчуванням 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    required: false,
    description: 'Кількість елементів на сторінку (за замовчуванням 10)',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Пошук за ФІО або email' })
  @IsOptional()
  @IsString()
  search?: string;
}
