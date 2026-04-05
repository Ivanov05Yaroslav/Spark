import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async initDefaultRoles() {
    const defaultRoles = ['STUDENT', 'TEACHER', 'PARENT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'];
    let createdCount = 0;

    for (const roleName of defaultRoles) {
      const exists = await this.prisma.role.findUnique({ where: { name: roleName } });
      if (!exists) {
        await this.prisma.role.create({ data: { name: roleName } });
        createdCount++;
      }
    }

    return { message: `Ініціалізація успішна. Створено нових ролей: ${createdCount}` };
  }

  async createRole(dto: CreateRoleDto) {
    const upperName = dto.name.toUpperCase();
    const existingRole = await this.prisma.role.findUnique({ where: { name: upperName } });

    if (existingRole) {
      throw new HttpException('Роль з такою назвою вже існує', HttpStatus.BAD_REQUEST);
    }

    return this.prisma.role.create({
      data: { name: upperName },
    });
  }

  async getAllRoles() {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getRoleById(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new HttpException('Роль не знайдено', HttpStatus.NOT_FOUND);
    return role;
  }

  async getRoleByName(name: string) {
    const role = await this.prisma.role.findUnique({ where: { name: name.toUpperCase() } });
    if (!role) throw new HttpException('Роль не знайдено', HttpStatus.NOT_FOUND);
    return role;
  }

  async updateRole(id: string, dto: UpdateRoleDto) {
    await this.getRoleById(id);

    return this.prisma.role.update({
      where: { id },
      data: { name: dto.name.toUpperCase() },
    });
  }

  async deleteRole(id: string) {
    const role = await this.getRoleById(id);

    if (role.name === 'SUPER_ADMIN') {
      throw new HttpException(
        'Видалення ролі SUPER_ADMIN заборонено системою',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.prisma.role.delete({ where: { id } });
  }
}
