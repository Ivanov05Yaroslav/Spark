import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AwsS3Service } from '../../core/integrations/aws/aws-s3.service';
import { EmailService } from '../../core/integrations/email/email.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ClassesService } from '../classes/classes.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RolesService } from '../roles/roles.service';
import { SubjectsService } from '../subjects/subjects.service';
import { AdminCreateUserDto, GetSchoolUsersDto } from './dto/admin-create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolesService: RolesService,
    private readonly classesService: ClassesService,
    private readonly subjectsService: SubjectsService,
    private readonly notificationsService: NotificationsService,
    private readonly awsS3Service: AwsS3Service,
    private readonly emailService: EmailService,
  ) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new HttpException('Користувача з таким ID не знайдено', HttpStatus.NOT_FOUND);
    }

    const { password, userRoles, ...result } = user as any;

    return {
      ...result,
      avatarUrl: user.avatarUrl
        ? await this.awsS3Service.generatePresignedUrl(user.avatarUrl)
        : null,
      roles: userRoles.map((ur: any) => ur.role.name),
    };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: { userRoles: { include: { role: true } } },
    });
  }

  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: { role: true },
        },
        school: true,
        studentClasses: {
          include: {
            class: true,
          },
        },
        teacherSubjects: {
          include: {
            subject: true,
          },
        },
        homeroomClass: true,
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

    if (!user) {
      throw new HttpException('Користувача не знайдено', HttpStatus.NOT_FOUND);
    }

    const roles = user.userRoles.map((ur) => ur.role.name);

    const profile: any = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      avatarUrl: user.avatarUrl
        ? await this.awsS3Service.generatePresignedUrl(user.avatarUrl)
        : null,
      roles,
      createdAt: user.createdAt,
      themePreference: user.themePreference,
    };

    if (user.school) {
      profile.school = {
        id: user.school.id,
        name: user.school.shortName || user.school.fullName,
        address: user.school.address,
      };
    }

    if (roles.includes('STUDENT')) {
      const activeClass = user.studentClasses[0]?.class;

      const coursesCount = await this.prisma.courseStudent.count({
        where: { studentId: userId },
      });

      const classmatesCount = activeClass
        ? await this.prisma.classStudent.count({
            where: {
              classId: activeClass.id,
              studentId: { not: userId },
            },
          })
        : 0;

      profile.class = activeClass ? { id: activeClass.id, name: activeClass.name } : null;
      profile.coursesCount = coursesCount;
      profile.classmatesCount = classmatesCount;
      profile.parentsCode = user.parentsCode;
    }

    if (roles.includes('TEACHER')) {
      profile.subjects = user.teacherSubjects.map((ts) => ({
        id: ts.subject.id,
        name: ts.subject.name,
      }));
      profile.homeroomClass = user.homeroomClass
        ? {
            id: user.homeroomClass.id,
            name: user.homeroomClass.name,
          }
        : null;
    }

    if (roles.includes('PARENT')) {
      profile.children = await Promise.all(
        user.parentRelations.map(async (relation) => {
          const childId = relation.student.id;
          const childClass = relation.student.studentClasses[0]?.class;

          const childCoursesCount = await this.prisma.courseStudent.count({
            where: { studentId: childId },
          });

          const childClassmatesCount = childClass
            ? await this.prisma.classStudent.count({
                where: {
                  classId: childClass.id,
                  studentId: { not: childId },
                },
              })
            : 0;

          return {
            id: childId,
            email: relation.student.email,
            firstName: relation.student.firstName,
            lastName: relation.student.lastName,
            middleName: relation.student.middleName,
            avatarUrl: relation.student.avatarUrl
              ? await this.awsS3Service.generatePresignedUrl(relation.student.avatarUrl)
              : null,
            class: childClass ? { id: childClass.id, name: childClass.name } : null,
            coursesCount: childCoursesCount,
            classmatesCount: childClassmatesCount,
          };
        }),
      );
    }

    return profile;
  }

  async getChildProfileForParent(parentId: string, childId: string) {
    const relation = await this.prisma.studentParent.findUnique({
      where: {
        studentId_parentId: {
          studentId: childId,
          parentId: parentId,
        },
      },
    });

    if (!relation) {
      throw new HttpException(
        "Доступ заборонено: цей учень не пов'язаний з вашим акаунтом",
        HttpStatus.FORBIDDEN,
      );
    }

    const child = await this.prisma.user.findUnique({
      where: { id: childId },
      include: {
        school: true,
        studentClasses: {
          include: { class: true },
        },
      },
    });

    if (!child) {
      throw new HttpException('Учня не знайдено в системі', HttpStatus.NOT_FOUND);
    }

    const activeClass = child.studentClasses[0]?.class;

    const coursesCount = await this.prisma.courseStudent.count({
      where: { studentId: childId },
    });

    const classmatesCount = activeClass
      ? await this.prisma.classStudent.count({
          where: {
            classId: activeClass.id,
            studentId: { not: childId },
          },
        })
      : 0;

    return {
      id: child.id,
      email: child.email,
      firstName: child.firstName,
      lastName: child.lastName,
      middleName: child.middleName,
      avatarUrl: child.avatarUrl
        ? await this.awsS3Service.generatePresignedUrl(child.avatarUrl)
        : null,
      roles: ['STUDENT'],
      school: child.school
        ? {
            id: child.school.id,
            name: child.school.shortName || child.school.fullName,
          }
        : null,
      class: activeClass ? { id: activeClass.id, name: activeClass.name } : null,
      coursesCount,
      classmatesCount,
    };
  }

  async getSchoolUsers(adminId: string, query: GetSchoolUsersDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin) {
      throw new HttpException('Адміністратора не знайдено', HttpStatus.NOT_FOUND);
    }
    if (!admin.schoolId) {
      throw new HttpException("Адміністратор не прив'язаний до школи", HttpStatus.FORBIDDEN);
    }

    const where: any = {
      schoolId: admin.schoolId,
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { middleName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          middleName: true,
          avatarUrl: true,
          createdAt: true,
          userRoles: {
            select: {
              role: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { lastName: 'asc' },
      }),
    ]);

    const formattedUsers = await Promise.all(
      users.map(async (user) => {
        const { userRoles, ...rest } = user;
        return {
          ...rest,
          avatarUrl: user.avatarUrl
            ? await this.awsS3Service.generatePresignedUrl(user.avatarUrl)
            : null,
          roles: userRoles.map((ur) => ur.role.name),
        };
      }),
    );

    return {
      data: formattedUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new HttpException('Користувача не знайдено', HttpStatus.NOT_FOUND);
    }

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

    const { password, ...result } = updatedUser as any;
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

    const forbiddenRoles = ['ADMIN', 'SUPER_ADMIN'];
    const hasForbiddenRole = dto.roles.some((role) => forbiddenRoles.includes(role.toUpperCase()));

    if (hasForbiddenRole) {
      throw new HttpException(
        'Заборонено створювати користувачів з правами адміністратора через цей ендпоінт',
        HttpStatus.FORBIDDEN,
      );
    }

    if (dto.roles.includes('STUDENT') && !dto.className) {
      throw new HttpException(
        "Для учня обов'язково потрібно вказати клас (className)",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.roles.includes('TEACHER') && (!dto.subjects || dto.subjects.length === 0)) {
      throw new HttpException(
        "Для вчителя обов'язково потрібно вказати хоча б один предмет (subjects)",
        HttpStatus.BAD_REQUEST,
      );
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

    if (dto.roles.includes('TEACHER') && dto.subjects && dto.subjects.length > 0) {
      for (const subjectName of dto.subjects) {
        const subject = await this.subjectsService.findOrCreateByName(subjectName);
        await this.subjectsService.assignToTeacher(newUser.id, subject.id);
      }
    }

    await this.notificationsService.create({
      senderId: adminId,
      receiverId: newUser.id,
      title: 'Акаунт створено',
      content: 'Ласкаво просимо на платформі Spark!',
      type: 'WELCOME',
      metadata: {},
    });

    await this.emailService.sendWelcomeEmail(newUser.email, plainPassword);

    const { password, userRoles, ...result } = newUser as any;

    return {
      ...result,
      avatarUrl: newUser.avatarUrl
        ? await this.awsS3Service.generatePresignedUrl(newUser.avatarUrl)
        : null,
      roles: dto.roles,
    };
  }

  async getBulkImportTemplateUrl() {
    return this.awsS3Service.generateDownloadUrl(
      'templates/spark_users_template.csv',
      'spark_users_template.csv',
    );
  }

  async getBulkImportInstructionUrl() {
    return this.awsS3Service.generateDownloadUrl(
      'templates/bulk_import_instruction.pdf',
      'Spark_Bulk_Import_Instruction.pdf',
    );
  }

  async bulkImportByAdmin(adminId: string, file: Express.Multer.File) {
    const results: {
      successful: string[];
      failed: { email: string; reason: string }[];
    } = {
      successful: [],
      failed: [],
    };

    let csvContent = file.buffer.toString('utf-8');
    if (csvContent.charCodeAt(0) === 0xfeff) {
      csvContent = csvContent.slice(1);
    }
    const lines = csvContent.split(/\r?\n/).filter((line) => line.trim() !== '');

    if (lines.length < 2) {
      throw new HttpException(
        'Файл порожній або не містить даних для імпорту',
        HttpStatus.BAD_REQUEST,
      );
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      const separator = line.includes(';') ? ';' : ',';
      const values = line.split(separator);

      if (values.length < 5) continue;

      const email = values[0]?.trim();
      const firstName = values[1]?.trim();
      const lastName = values[2]?.trim();
      const middleName = values[3]?.trim();
      const rolesStr = values[4]?.trim();
      const className = values[5]?.trim();
      const subjectsStr = values[6]?.trim();

      if (!email || !firstName || !lastName || !rolesStr) {
        results.failed.push({
          email: email || `Рядок ${i + 1}`,
          reason: "Пропущені обов'язкові поля (email, firstName, lastName, roles)",
        });
        continue;
      }

      const roles = rolesStr
        .split('|')
        .map((r) => r.trim())
        .filter(Boolean);
      const subjects = subjectsStr
        ? subjectsStr
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const userDto: AdminCreateUserDto = {
        email,
        firstName,
        lastName,
        middleName: middleName || undefined,
        roles,
        className: className || undefined,
        subjects: subjects.length > 0 ? subjects : undefined,
      };

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
      throw new HttpException('Не можна видалити самого себе', HttpStatus.FORBIDDEN);
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: { userRoles: { include: { role: true } } },
    });

    if (!targetUser) {
      throw new HttpException('Користувача не знайдено', HttpStatus.NOT_FOUND);
    }

    const isTargetAdmin = targetUser.userRoles.some((ur) => ur.role.name === 'ADMIN');
    if (isTargetAdmin) {
      throw new HttpException('Неможливо видалити іншого адміністратора', HttpStatus.FORBIDDEN);
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

    const parentName = parent ? `${parent.firstName} ${parent.lastName}` : 'Батьки';
    await this.notificationsService.create({
      senderId: parentId,
      receiverId: student.id,
      title: 'Підключення батьків',
      content: `Користувач ${parentName} отримав доступ до вашого профілю як "Батьки".`,
      type: 'AUTH',
      metadata: { parentId: parentId },
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
