import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

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
