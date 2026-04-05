import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'TEACHER', description: 'Назва ролі (бажано ВЕЛИКИМИ літерами)' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class UpdateRoleDto {
  @ApiProperty({ example: 'HEAD_TEACHER', description: 'Нова назва ролі' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
