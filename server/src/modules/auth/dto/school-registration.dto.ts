import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class InitSchoolRegistrationDto {
  @ApiProperty({ example: '145819', description: 'Код закладу в ЄДЕБО' })
  @IsString()
  @IsNotEmpty()
  edeboId!: string;
}

export class SchoolDirectorDetailsDto {
  @ApiProperty({ example: 'uuid-сесії' })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @ApiProperty({ example: 'director@school.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8, { message: 'Пароль має містити щонайменше 8 символів' })
  password!: string;

  @ApiProperty({ example: 'Олександр' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Іванов' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: 'Сергійович', required: false })
  @IsString()
  @IsOptional()
  middleName?: string;
}

export class ResendSchoolEmailCodeDto {
  @ApiProperty({ example: 'uuid-сесії', description: 'ID поточної сесії реєстрації' })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;
}

export class VerifySchoolEmailDto {
  @ApiProperty({ example: 'uuid-сесії' })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @ApiProperty({ example: '123456', description: '6-значний код з email' })
  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class SubmitSchoolDocumentsDto {
  @ApiProperty({ example: 'uuid-сесії' })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: "Паспорт громадянина України (Обов'язково, макс. 5)",
    required: true,
  })
  passportDocs?: any[];

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Витяг з ЄДР (макс. 5)',
    required: false,
  })
  edrDocs?: any[];

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Наказ про призначення (макс. 5)',
    required: false,
  })
  appointmentOrderDocs?: any[];

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Трудовий контракт (макс. 5)',
    required: false,
  })
  employmentContractDocs?: any[];
}
