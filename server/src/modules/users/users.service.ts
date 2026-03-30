import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { userRoles: { include: { role: true } } },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user) {
      throw new HttpException(
        'Користувача з таким ID не знайдено',
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: { userRoles: { include: { role: true } } },
    });
  }

  async create(data: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new HttpException(
        'Користувач з таким email вже існує',
        HttpStatus.BAD_REQUEST,
      );
    }

    let defaultRole = await this.prisma.role.findUnique({
      where: { name: 'USER' },
    });
    if (!defaultRole) {
      defaultRole = await this.prisma.role.create({ data: { name: 'USER' } });
    }

    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        userRoles: {
          create: {
            roleId: defaultRole.id,
          },
        },
      },
      include: { userRoles: { include: { role: true } } },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.findById(userId);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        middleName: dto.middleName,
        lastName: dto.lastName,
        avatarUrl: dto.avatarUrl,
      },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  }

  async addRole(userId: string, roleName: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      throw new HttpException('Користувача не знайдено', HttpStatus.NOT_FOUND);

    const role = await this.prisma.role.findUnique({
      where: { name: roleName.toUpperCase() },
    });
    if (!role)
      throw new HttpException(
        `Роль '${roleName}' не знайдено у системі`,
        HttpStatus.NOT_FOUND,
      );

    const existingUserRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: { userId, roleId: role.id },
      },
    });

    if (existingUserRole) {
      throw new HttpException(
        'Користувач вже має цю роль',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.userRole.create({
      data: {
        userId,
        roleId: role.id,
      },
    });

    return { message: `Роль ${role.name} успішно додана користувачу` };
  }

  async removeRole(userId: string, roleName: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      throw new HttpException('Користувача не знайдено', HttpStatus.NOT_FOUND);

    const role = await this.prisma.role.findUnique({
      where: { name: roleName.toUpperCase() },
    });
    if (!role)
      throw new HttpException(
        `Роль '${roleName}' не знайдено у системі`,
        HttpStatus.NOT_FOUND,
      );

    const existingUserRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: { userId, roleId: role.id },
      },
    });

    if (!existingUserRole) {
      throw new HttpException(
        'Користувач не має цієї ролі, тому її не можна видалити',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userRolesCount = await this.prisma.userRole.count({
      where: { userId },
    });
    if (userRolesCount === 1) {
      throw new HttpException(
        'Не можна видалити єдину роль користувача. Додайте іншу роль перед видаленням цієї.',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.prisma.userRole.delete({
      where: {
        userId_roleId: { userId, roleId: role.id },
      },
    });

    return { message: `Роль ${role.name} успішно видалена у користувача` };
  }
}
