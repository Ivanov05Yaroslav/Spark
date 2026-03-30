import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ManageRoleDto {
  @ApiProperty({ example: 'TEACHER', description: 'Назва ролі (STUDENT, TEACHER, PARENT, MODERATOR, ADMIN, SUPER_ADMIN)' })
  @IsString()
  @IsNotEmpty()
  roleName: string;
}