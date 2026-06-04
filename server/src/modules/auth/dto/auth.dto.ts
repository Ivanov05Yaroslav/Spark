import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUUID, MinLength, IsArray, ArrayNotEmpty, IsOptional } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ example: 'test@school.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;
}

export class LoginUserDto {
  @ApiProperty({ example: 'test@school.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;
}

export class InitSchoolRegistrationDto {
  @ApiProperty({ example: '145819', description: 'Код закладу в ЄДЕБО' })
  @IsString()
  @IsNotEmpty()
  edeboId!: string;
}

export class DiiaCallbackDto {
  @ApiProperty({ example: 'uuid-сесії', description: 'ID тимчасової сесії реєстрації' })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @ApiProperty({
    example: 'mock_token_Ковальова Світлана Михайлівна',
    description: 'Токен від Дії. Для тесту передавайте ПІБ директора.',
  })
  @IsString()
  @IsNotEmpty()
  diiaToken!: string;
}

export class SendSchoolEmailCodeDto {
  @ApiProperty({ example: 'uuid-сесії' })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @ApiProperty({ example: 'director@school.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(6)
  password!: string;
}

export class ResendSchoolEmailCodeDto {
  @ApiProperty({ example: 'uuid-сесії', description: 'ID поточної сесії реєстрації' })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;
}

export class VerifySchoolEmailCodeDto {
  @ApiProperty({ example: 'uuid-сесії' })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @ApiProperty({ example: '123456', description: '6-значний код з email' })
  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class ForgotPasswordSendCodeDto {
  @ApiProperty({ example: 'director@school.com', description: 'Email для скидання пароля' })
  @IsEmail()
  email!: string;
}

export class ForgotPasswordResendCodeDto {
  @ApiProperty({ example: 'uuid-сесії' })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;
}

export class ForgotPasswordVerifyCodeDto {
  @ApiProperty({ example: 'uuid-сесії' })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @ApiProperty({ example: '123456', description: '6-значний код з email' })
  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class ForgotPasswordResetDto {
  @ApiProperty({ example: 'uuid-сесії' })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @ApiProperty({ example: 'NewSecurePass123!' })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldSecurePass123!' })
  @IsString()
  @IsNotEmpty()
  oldPassword!: string;

  @ApiProperty({ example: 'NewSecurePass123!' })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}

export class InitParentRegistrationDto {
  @ApiProperty({ 
    example: ['123456', '654321'], 
    description: 'Масив 6-значних кодів дітей' 
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Необхідно вказати хоча б один код дитини' })
  @IsString({ each: true })
  childrenCodes!: string[];
}

export class ParentRegistrationDetailsDto {
  @ApiProperty({ example: 'uuid-сесії' })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @ApiProperty({ example: 'parent@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass123!' })
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

export class VerifyParentEmailDto {
  @ApiProperty({ example: 'uuid-сесії' })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @ApiProperty({ example: '123456', description: '6-значний код з email' })
  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class ResendParentEmailCodeDto {
  @ApiProperty({ example: 'uuid-сесії' })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;
}
