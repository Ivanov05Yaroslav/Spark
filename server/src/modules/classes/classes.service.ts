import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(schoolId: string, name: string) {
    const exists = await this.prisma.class.findFirst({ where: { schoolId, name } });
    if (exists)
      throw new HttpException('Клас з такою назвою вже існує в цій школі', HttpStatus.BAD_REQUEST);
    return this.prisma.class.create({ data: { name, schoolId } });
  }

  async createBulk(schoolId: string, names: string[]) {
    const existing = await this.prisma.class.findMany({ where: { schoolId, name: { in: names } } });
    const existingNames = existing.map((c) => c.name);
    const newNames = names.filter((n) => !existingNames.includes(n));

    if (newNames.length > 0) {
      await this.prisma.class.createMany({
        data: newNames.map((name) => ({ name, schoolId })),
      });
    }
    return {
      message: `Створено класів: ${newNames.length}. Пропущено існуючих: ${existingNames.length}`,
    };
  }

  async findBySchool(schoolId: string) {
    return this.prisma.class.findMany({
      where: { schoolId },
      include: {
        homeroomTeacher: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { students: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOrCreateClass(schoolId: string, name: string) {
    let classroom = await this.prisma.class.findFirst({ where: { schoolId, name } });
    if (!classroom) {
      classroom = await this.prisma.class.create({ data: { name, schoolId } });
    }
    return classroom;
  }

  async addStudent(classId: string, studentId: string) {
    const exists = await this.prisma.classStudent.findUnique({
      where: { classId_studentId: { classId, studentId } },
    });
    if (!exists) {
      await this.prisma.classStudent.create({ data: { classId, studentId } });
    }
    return { message: 'Учня додано до класу' };
  }

  async removeStudent(classId: string, studentId: string) {
    await this.prisma.classStudent.delete({ where: { classId_studentId: { classId, studentId } } });
    return { message: 'Учня видалено з класу' };
  }

  async setHomeroomTeacher(classId: string, teacherId: string) {
    await this.prisma.class.update({
      where: { id: classId },
      data: { homeroomTeacherId: teacherId },
    });
    return { message: 'Класного керівника призначено' };
  }

  async removeHomeroomTeacher(classId: string) {
    await this.prisma.class.update({
      where: { id: classId },
      data: { homeroomTeacherId: null },
    });
    return { message: 'Класного керівника знято' };
  }
}
