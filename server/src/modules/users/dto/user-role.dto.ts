import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ManageRoleDto {
  @ApiProperty({
    example: 'TEACHER',
    description: 'Назва ролі (STUDENT, TEACHER, PARENT, MODERATOR, ADMIN, SUPER_ADMIN)',
  })
  @IsString()
  @IsNotEmpty()
  roleName!: string;
}

export class SyncRolesDto {
  @ApiProperty({
    example: ['TEACHER', 'MODERATOR'],
    description: 'Масив ролей, які повинні залишитися у користувача. Усі інші будуть видалені.',
  })
  @IsArray()
  @IsString({ each: true })
  roles!: string[];
}
