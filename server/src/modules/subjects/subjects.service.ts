import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NUS_GROUPS_CONFIG } from '../../common/consts/nus-data';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async initNusSubjects() {
    const nusSubjects = [
      'Українська мова',
      'Українська література',
      'Зарубіжна література',
      'Англійська мова',
      'Математика',
      'Алгебра',
      'Геометрія',
      'Історія України',
      'Всесвітня історія',
      'Біологія',
      'Фізика',
      'Хімія',
      'Географія',
      'Інформатика',
      'Фізична культура',
      'Мистецтво',
      'Основи здоров’я',
      'Трудове навчання',
      'Я досліджую світ',
    ];

    let count = 0;
    for (const name of nusSubjects) {
      const exists = await this.prisma.subject.findUnique({ where: { name } });
      if (!exists) {
        await this.prisma.subject.create({ data: { name } });
        count++;
      }
    }
    return { message: `Предмети НУШ успішно додані. Нових: ${count}` };
  }

  async findAll() {
    return this.prisma.subject.findMany({ orderBy: { name: 'asc' } });
  }

  async findOrCreateByName(name: string) {
    let subject = await this.prisma.subject.findUnique({ where: { name } });
    if (!subject) {
      subject = await this.prisma.subject.create({ data: { name } });
    }
    return subject;
  }

  async create(name: string) {
    const exists = await this.prisma.subject.findUnique({ where: { name } });
    if (exists) throw new HttpException('Предмет вже існує', HttpStatus.BAD_REQUEST);
    return this.prisma.subject.create({ data: { name } });
  }

  async delete(id: string) {
    return this.prisma.subject.delete({ where: { id } });
  }

  async assignToTeacher(teacherId: string, subjectId: string) {
    const exists = await this.prisma.teacherSubject.findUnique({
      where: { teacherId_subjectId: { teacherId, subjectId } },
    });
    if (exists)
      throw new HttpException('Цей предмет вже призначено вчителю', HttpStatus.BAD_REQUEST);

    await this.prisma.teacherSubject.create({ data: { teacherId, subjectId } });
    return { message: 'Предмет успішно призначено вчителю' };
  }

  async removeFromTeacher(teacherId: string, subjectId: string) {
    await this.prisma.teacherSubject.delete({
      where: { teacherId_subjectId: { teacherId, subjectId } },
    });
    return { message: 'Предмет успішно забрано у вчителя' };
  }

  async initNusGroups() {
    let count = 0;
    for (const [subjectName, groupNames] of Object.entries(NUS_GROUPS_CONFIG)) {
      const subject = await this.prisma.subject.findUnique({ where: { name: subjectName } });

      if (subject) {
        for (const name of groupNames) {
          const exists = await this.prisma.nusGroup.findFirst({
            where: { subjectId: subject.id, name },
          });
          if (!exists) {
            await this.prisma.nusGroup.create({ data: { subjectId: subject.id, name } });
            count++;
          }
        }
      }
    }
    return { message: `Групи результатів НУШ успішно ініціалізовано. Нових: ${count}` };
  }

  async getNusGroupsBySubject(subjectId: string) {
    return this.prisma.nusGroup.findMany({
      where: { subjectId },
      orderBy: { name: 'asc' },
    });
  }

  async getMySubjects(teacherId: string) {
    const teacherSubjects = await this.prisma.teacherSubject.findMany({
      where: { teacherId },
      include: { subject: true },
    });
    return teacherSubjects.map((ts) => ts.subject);
  }
}
