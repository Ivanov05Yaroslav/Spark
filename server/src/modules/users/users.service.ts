import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

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
      throw new HttpException('Користувача з таким ID не знайдено', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: { userRoles: { include: { role: true } } },
    });
  }

  async create(data: any) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new HttpException('Користувач з таким email вже існує', HttpStatus.BAD_REQUEST);
    }

    let defaultRole = await this.prisma.role.findUnique({ where: { name: 'USER' } });
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
}