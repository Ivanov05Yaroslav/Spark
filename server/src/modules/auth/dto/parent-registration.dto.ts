import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUUID, MinLength, IsArray, ArrayNotEmpty, IsOptional } from 'class-validator';

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