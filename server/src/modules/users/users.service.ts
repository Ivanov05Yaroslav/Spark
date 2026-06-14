import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AwsS3Service } from '../../core/integrations/aws/aws-s3.service';
import { EmailService } from '../../core/integrations/email/email.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ClassesService } from '../classes/classes.service';
import { RolesService } from '../roles/roles.service';
import { SubjectsService } from '../subjects/subjects.service';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolesService: RolesService,
    private readonly classesService: ClassesService,
    private readonly subjectsService: SubjectsService,
    private readonly awsS3Service: AwsS3Service,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: AdminCreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new HttpException('Користувач з таким email вже існує', HttpStatus.BAD_REQUEST);
    }

    const roleRecords = await this.prisma.role.findMany({
      where: { name: { in: dto.roles } },
    });

    if (roleRecords.length !== dto.roles.length) {
      throw new HttpException('Одну або декілька ролей не знайдено', HttpStatus.BAD_REQUEST);
    }

    let generatedParentsCode: string | null = null;

    if (dto.roles.includes('STUDENT')) {
      let isUnique = false;
      while (!isUnique) {
        generatedParentsCode = Math.floor(100000 + Math.random() * 900000).toString();
        const existingCode = await this.prisma.user.findUnique({
          where: { parentsCode: generatedParentsCode },
        });
        if (!existingCode) {
          isUnique = true;
        }
      }
    }

    const hashPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        schoolId: dto.schoolId,
        parentsCode: generatedParentsCode,
        userRoles: {
          create: roleRecords.map((r) => ({ roleId: r.id })),
        },
      },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    return user;
  }

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

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: { include: { role: true } },
        school: true,
      },
    });

    if (!user) {
      throw new HttpException('Користувач не знайдений', HttpStatus.NOT_FOUND);
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    let extraData: any = {};

    if (roles.includes('STUDENT')) {
      const studentData = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          studentClasses: {
            include: {
              class: {
                include: {
                  _count: {
                    select: { students: true },
                  },
                },
              },
            },
          },
          enrolledCourses: {
            include: {
              course: {
                include: { subject: true },
              },
            },
          },
        },
      });

      extraData = {
        parentsCode: user.parentsCode,
        classes:
          studentData?.studentClasses.map((sc) => ({
            id: sc.class.id,
            name: sc.class.name,
            classmatesCount: Math.max(0, (sc.class._count?.students || 1) - 1),
          })) || [],
        coursesCount: studentData?.enrolledCourses.length || 0,
        courses: studentData?.enrolledCourses.map((sc) => sc.course.subject.name) || [],
      };
    }

    if (roles.includes('PARENT')) {
      const parentData = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          parentRelations: {
            include: {
              student: {
                include: {
                  studentClasses: {
                    include: { class: true },
                  },
                },
              },
            },
          },
        },
      });

      extraData = {
        children:
          parentData?.parentRelations.map((rel) => ({
            id: rel.student.id,
            fullName:
              `${rel.student.lastName} ${rel.student.firstName} ${rel.student.middleName || ''}`.trim(),
            classes: rel.student.studentClasses.map((sc) => sc.class.name),
          })) || [],
      };
    }

    if (roles.includes('TEACHER')) {
      const teacherData = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          homeroomClasses: true,
          teacherSubjects: {
            include: { subject: true },
          },
        },
      });

      extraData = {
        homeroomClasses: teacherData?.homeroomClasses.map((c) => c.name) || [],
        subjects: teacherData?.teacherSubjects.map((ts) => ts.subject.name) || [],
      };
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      avatarUrl: user.avatarUrl,
      school: user.school
        ? {
            id: user.school.id,
            name: user.school.shortName || user.school.fullName,
            fullName: user.school.fullName,
            city: user.school.city,
            address: user.school.address,
          }
        : null,
      roles,
      ...extraData,
    };
  }

  async getSchoolTeachers(schoolId: string) {
    return this.prisma.user.findMany({
      where: {
        schoolId,
        userRoles: { some: { role: { name: 'TEACHER' } } },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        middleName: true,
        lastName: true,
        avatarUrl: true,
        teacherSubjects: { select: { subject: true } },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async getTeachersBySubject(schoolId: string, subjectId: string, currentTeacherId: string) {
    return this.prisma.user.findMany({
      where: {
        schoolId,
        id: { not: currentTeacherId },
        userRoles: { some: { role: { name: 'TEACHER' } } },
        teacherSubjects: { some: { subjectId } },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        middleName: true,
        lastName: true,
        avatarUrl: true,
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, file?: any) {
    const user = await this.findById(userId);

    let newAvatarUrl = user.avatarUrl;

    if (file) {
      const uploadedUrl = await this.awsS3Service.uploadFile(file, `users/avatars/${userId}`);

      if (user.avatarUrl && user.avatarUrl.includes('amazonaws.com')) {
        await this.awsS3Service.deleteFile(user.avatarUrl);
      }

      newAvatarUrl = uploadedUrl;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        middleName: dto.middleName,
        lastName: dto.lastName,
        avatarUrl: newAvatarUrl,
      },
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async addRole(userId: string, roleName: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException('Користувача не знайдено', HttpStatus.NOT_FOUND);

    const role = await this.prisma.role.findUnique({
      where: { name: roleName.toUpperCase() },
    });
    if (!role)
      throw new HttpException(`Роль '${roleName}' не знайдено у системі`, HttpStatus.NOT_FOUND);

    const existingUserRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: { userId, roleId: role.id },
      },
    });

    if (existingUserRole) {
      throw new HttpException('Користувач вже має цю роль', HttpStatus.BAD_REQUEST);
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
    if (!user) throw new HttpException('Користувача не знайдено', HttpStatus.NOT_FOUND);

    const role = await this.prisma.role.findUnique({
      where: { name: roleName.toUpperCase() },
    });
    if (!role)
      throw new HttpException(`Роль '${roleName}' не знайдено у системі`, HttpStatus.NOT_FOUND);

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

  async createByAdmin(adminId: string, dto: AdminCreateUserDto) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });

    if (!admin) {
      throw new HttpException('Адміністратора не знайдено', HttpStatus.NOT_FOUND);
    }
    if (!admin.schoolId) {
      throw new HttpException("Адміністратор не прив'язаний до школи", HttpStatus.FORBIDDEN);
    }

    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists)
      throw new HttpException(`Користувач з email ${dto.email} вже існує`, HttpStatus.BAD_REQUEST);

    const roleRecords = await this.prisma.role.findMany({
      where: { name: { in: dto.roles } },
    });
    if (roleRecords.length === 0 || roleRecords.length !== dto.roles.length) {
      throw new HttpException('Одну або декілька ролей не знайдено', HttpStatus.BAD_REQUEST);
    }

    let generatedParentsCode: string | null = null;
    if (dto.roles.includes('STUDENT')) {
      let isUnique = false;
      while (!isUnique) {
        generatedParentsCode = Math.floor(100000 + Math.random() * 900000).toString();
        const existingCode = await this.prisma.user.findUnique({
          where: { parentsCode: generatedParentsCode },
        });
        if (!existingCode) isUnique = true;
      }
    }

    const plainPassword = Math.random().toString(36).substring(2, 10) + 'A1!';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName || '',
        schoolId: admin.schoolId,
        parentsCode: generatedParentsCode,
        isEmailVerified: true,
        isPasswordCustom: false,
        userRoles: { create: roleRecords.map((r) => ({ roleId: r.id })) },
      },
    });

    if (dto.roles.includes('STUDENT') && dto.className) {
      const classroom = await this.classesService.findOrCreateClass(admin.schoolId, dto.className);
      await this.classesService.addStudent(classroom.id, newUser.id);
    }

    if (dto.roles.includes('TEACHER')) {
      if (dto.subjects && dto.subjects.length > 0) {
        for (const subjectName of dto.subjects) {
          const subject = await this.subjectsService.findOrCreateByName(subjectName);
          await this.subjectsService.assignToTeacher(newUser.id, subject.id);
        }
      }
      if (dto.isHomeroomFor) {
        const classroom = await this.classesService.findOrCreateClass(
          admin.schoolId,
          dto.isHomeroomFor,
        );
        await this.classesService.setHomeroomTeacher(classroom.id, newUser.id);
      }
    }

    await this.emailService.sendWelcomeEmail(newUser.email, plainPassword);

    const { password, ...result } = newUser;
    return result;
  }

  async bulkImportByAdmin(adminId: string, users: AdminCreateUserDto[]) {
    const results: {
      successful: string[];
      failed: { email: string; reason: string }[];
    } = {
      successful: [],
      failed: [],
    };

    for (const userDto of users) {
      try {
        await this.createByAdmin(adminId, userDto);
        results.successful.push(userDto.email);
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Невідома помилка';
        results.failed.push({ email: userDto.email, reason });
      }
    }

    return {
      message: `Імпорт завершено. Успішно: ${results.successful.length}, Помилок: ${results.failed.length}`,
      details: results,
    };
  }

  async syncUserRoles(adminId: string, targetUserId: string, roleNames: string[]) {
    if (adminId === targetUserId) {
      throw new HttpException(
        'Ви не можете змінити ролі самому собі з панелі керування',
        HttpStatus.FORBIDDEN,
      );
    }
    await this.findById(targetUserId);

    if (roleNames.length === 0) {
      throw new HttpException('Користувач повинен мати хоча б одну роль', HttpStatus.BAD_REQUEST);
    }

    const newRoles: any[] = [];
    for (const rName of roleNames) {
      const role = await this.rolesService.getRoleByName(rName);
      newRoles.push(role);
    }

    await this.prisma.userRole.deleteMany({
      where: { userId: targetUserId },
    });

    await this.prisma.userRole.createMany({
      data: newRoles.map((r) => ({
        userId: targetUserId,
        roleId: r.id,
      })),
    });

    return { message: 'Список ролей користувача успішно оновлено' };
  }

  async deleteUser(adminId: string, targetUserId: string) {
    if (adminId === targetUserId) {
      throw new HttpException('Ви не можете видалити власний акаунт', HttpStatus.FORBIDDEN);
    }

    const targetUser = await this.findById(targetUserId);

    const isTargetAdmin = targetUser.userRoles.some((ur) => ur.role.name === 'ADMIN');
    if (isTargetAdmin) {
      throw new HttpException('Не можна видалити іншого адміністратора', HttpStatus.FORBIDDEN);
    }

    await this.prisma.class.updateMany({
      where: { homeroomTeacherId: targetUserId },
      data: { homeroomTeacherId: null },
    });

    await this.prisma.school.updateMany({
      where: { directorId: targetUserId },
      data: { directorId: null },
    });

    if (targetUser.avatarUrl && targetUser.avatarUrl.includes('amazonaws.com')) {
      await this.awsS3Service.deleteFile(targetUser.avatarUrl);
    }

    await this.prisma.user.delete({
      where: { id: targetUserId },
    });

    return { message: 'Користувача успішно видалено з системи' };
  }

  async getMyChildren(parentId: string) {
    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
      include: {
        parentRelations: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
                avatarUrl: true,
                email: true,
                schoolId: true,
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new HttpException('Батьківський профіль не знайдено', HttpStatus.NOT_FOUND);
    }

    return parent.parentRelations.map((relation) => relation.student);
  }

  async addChild(parentId: string, parentsCode: string) {
    const student = await this.prisma.user.findUnique({
      where: { parentsCode },
    });

    if (!student) {
      throw new HttpException('Учня з таким кодом не знайдено', HttpStatus.NOT_FOUND);
    }

    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
      include: { parentRelations: true },
    });

    const isAlreadyAdded = parent?.parentRelations.some((rel) => rel.studentId === student.id);

    if (isAlreadyAdded) {
      throw new HttpException('Цю дитину вже додано до вашого профілю', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.user.update({
      where: { id: parentId },
      data: {
        parentRelations: {
          create: {
            studentId: student.id,
          },
        },
      },
    });

    return {
      message: 'Дитину успішно додано до вашого профілю',
      studentId: student.id,
    };
  }

  async removeChild(parentId: string, studentId: string) {
    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
      include: { parentRelations: true },
    });

    const hasRelation = parent?.parentRelations.some((rel) => rel.studentId === studentId);

    if (!hasRelation) {
      throw new HttpException("Зв'язок з цією дитиною не знайдено", HttpStatus.NOT_FOUND);
    }

    await this.prisma.user.update({
      where: { id: parentId },
      data: {
        parentRelations: {
          deleteMany: {
            studentId: studentId,
          },
        },
      },
    });

    return { message: "Зв'язок з дитиною успішно видалено" };
  }
}
