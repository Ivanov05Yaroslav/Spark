import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AwsS3Service } from '../../core/integrations/aws/aws-s3.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  private async verifyTeacherWriteAccess(courseId: string, teacherId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { coTeachers: true, subject: true },
    });
    if (!course) throw new HttpException('Курс не знайдено', HttpStatus.NOT_FOUND);

    const isCreator = course.creatorId === teacherId;
    const isCoTeacher = course.coTeachers.some((ct) => ct.teacherId === teacherId);

    if (!isCreator && !isCoTeacher) {
      throw new HttpException('У вас немає прав для роботи з цим курсом', HttpStatus.FORBIDDEN);
    }
    return course;
  }

  private async getOrCreateModuleId(courseId: string, moduleId?: string, newTitle?: string) {
    if (!moduleId && (!newTitle || newTitle.trim() === '')) {
      throw new HttpException(
        "Урок обов'язково має належати до модуля (теми)",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (newTitle && newTitle.trim() !== '') {
      const cleanedTitle = newTitle.trim();
      const existingModule = await this.prisma.courseModule.findFirst({
        where: { courseId, title: { equals: cleanedTitle, mode: 'insensitive' } },
      });

      if (existingModule) {
        return existingModule.id;
      } else {
        const newModule = await this.prisma.courseModule.create({
          data: { courseId, title: cleanedTitle },
        });
        return newModule.id;
      }
    }
    return moduleId as string;
  }

  async create(teacherId: string, dto: CreateLessonDto) {
    const course = await this.verifyTeacherWriteAccess(dto.courseId, teacherId);

    if (dto.nusGroupIds && dto.nusGroupIds.length > 0) {
      const nusGroups = await this.prisma.nusGroup.findMany({
        where: { id: { in: dto.nusGroupIds } },
      });
      const invalidGroups = nusGroups.filter((g) => g.subjectId !== course.subjectId);
      if (invalidGroups.length > 0) {
        throw new HttpException(
          'Деякі з обраних груп НУШ належать до іншого предмету!',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const finalModuleId = await this.getOrCreateModuleId(
      dto.courseId,
      dto.courseModuleId,
      dto.newModuleTitle,
    );

    const lesson = await this.prisma.lesson.create({
      data: {
        courseId: dto.courseId,
        courseModuleId: finalModuleId,
        title: dto.title,
        description: dto.description,
        date: new Date(dto.date),
        nusGroups:
          dto.nusGroupIds && dto.nusGroupIds.length > 0
            ? { connect: dto.nusGroupIds.map((id) => ({ id })) }
            : undefined,
      },
      include: { nusGroups: true },
    });

    return this.findOne(teacherId, lesson.id);
  }

  async findAllByCourse(userId: string, courseId: string) {
    return this.prisma.lesson.findMany({
      where: { courseId },
      include: {
        nusGroups: true,
        task: { select: { id: true, title: true, deadline: true } },
        test: { select: { id: true, title: true, deadline: true } },
      },
      orderBy: { date: 'asc' },
    });
  }

  async findOne(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        courseModule: true,
        nusGroups: true,
        task: true,
        test: true,
      },
    });
    if (!lesson) throw new HttpException('Урок не знайдено', HttpStatus.NOT_FOUND);
    return lesson;
  }

  async update(teacherId: string, lessonId: string, dto: UpdateLessonDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new HttpException('Урок не знайдено', HttpStatus.NOT_FOUND);

    const course = await this.verifyTeacherWriteAccess(lesson.courseId, teacherId);

    if (dto.nusGroupIds && dto.nusGroupIds.length > 0) {
      const nusGroups = await this.prisma.nusGroup.findMany({
        where: { id: { in: dto.nusGroupIds } },
      });
      const invalidGroups = nusGroups.filter((g) => g.subjectId !== course.subjectId);
      if (invalidGroups.length > 0) {
        throw new HttpException(
          'Деякі з обраних груп НУШ належать до іншого предмету!',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: dto.title,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : undefined,
        courseModuleId: dto.courseModuleId || undefined,
        nusGroups: dto.nusGroupIds ? { set: dto.nusGroupIds.map((id) => ({ id })) } : undefined,
      },
      include: { nusGroups: true, task: true, test: true },
    });
  }

  async delete(teacherId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { task: true },
    });
    if (!lesson) throw new HttpException('Урок не знайдено', HttpStatus.NOT_FOUND);

    await this.verifyTeacherWriteAccess(lesson.courseId, teacherId);

    if (lesson.task && lesson.task.attachments.length > 0) {
      const awsUrls = lesson.task.attachments.filter((url) => url.includes('amazonaws.com'));
      for (const url of awsUrls) {
        try {
          await this.awsS3Service.deleteFile(url);
        } catch (e) {
          console.error('Не вдалося видалити файл таски з S3 при видаленні уроку', e);
        }
      }
    }

    await this.prisma.lesson.delete({ where: { id: lessonId } });
    return { message: "Урок та всі пов'язані з ним таски і тести успішно видалено" };
  }
}
