import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AwsS3Service } from '../../core/integrations/aws/aws-s3.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly awsS3Service: AwsS3Service,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async verifyTeacherWriteAccess(courseId: string, teacherId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { coTeachers: true },
    });
    if (!course) throw new HttpException('Курс не знайдено', HttpStatus.NOT_FOUND);

    const isCreator = course.creatorId === teacherId;
    const isCoTeacher = course.coTeachers.some((ct) => ct.teacherId === teacherId);

    if (!isCreator && !isCoTeacher) {
      throw new HttpException(
        'У вас немає прав для додавання завдань у цей курс',
        HttpStatus.FORBIDDEN,
      );
    }
    return course;
  }

  async create(teacherId: string, dto: CreateTaskDto, files: any[]) {
    const course = await this.verifyTeacherWriteAccess(dto.courseId, teacherId);

    if (dto.nusGroupId) {
      const nusGroup = await this.prisma.nusGroup.findUnique({
        where: { id: dto.nusGroupId },
      });
      if (!nusGroup) throw new HttpException('Групу НУШ не знайдено', HttpStatus.NOT_FOUND);
      if (nusGroup.subjectId !== course.subjectId) {
        throw new HttpException(
          'Помилка: Ця група результатів НУШ належить до іншого предмету!',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const attachments: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const fileUrl = await this.awsS3Service.uploadFile(file, `courses/${dto.courseId}/tasks`);
        attachments.push(fileUrl);
      }
    }

    if (dto.links && dto.links.length > 0) {
      attachments.push(...dto.links);
    }

    const task = await this.prisma.task.create({
      data: {
        courseId: dto.courseId,
        creatorId: teacherId,
        title: dto.title,
        description: dto.description,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        nusGroupId: dto.nusGroupId,
        courseModuleId: dto.courseModuleId || null,
        isHidden: dto.isHidden || false,
        attachments: attachments,
      },
      include: { nusGroup: true, courseModule: true },
    });

    if (!task.isHidden) {
      const participants = await this.notificationsService.getCourseParticipants(
        dto.courseId,
        teacherId,
      );
      const notifications = participants.map((id) => ({
        senderId: teacherId,
        receiverId: id,
        title: 'Нове завдання',
        content: `Додано нове завдання: "${dto.title}".`,
        type: 'TASK',
      }));
      await this.notificationsService.createMany(notifications);
    }

    return task;
  }

  async findAllByCourse(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { students: true, coTeachers: true, class: true },
    });
    if (!course) throw new HttpException('Курс не знайдено', HttpStatus.NOT_FOUND);

    const isTeacher =
      course.creatorId === userId || course.coTeachers.some((ct) => ct.teacherId === userId);
    const isStudent = course.students.some((s) => s.studentId === userId);
    const isHomeroom = course.class.homeroomTeacherId === userId;

    if (!isTeacher && !isStudent && !isHomeroom) {
      throw new HttpException('Ви не є учасником цього курсу', HttpStatus.FORBIDDEN);
    }

    const whereClause: any = { courseId };
    if (!isTeacher) whereClause.isHidden = false;

    return this.prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } },
        nusGroup: true,
        courseModule: { select: { id: true, title: true } }
      },
    });
  }

  async findOne(userId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        course: { include: { students: true, coTeachers: true, class: true } },
        nusGroup: true,
        courseModule: { select: { id: true, title: true } }
      },
    });
    if (!task) throw new HttpException('Завдання не знайдено', HttpStatus.NOT_FOUND);

    const { course: _, ...result } = task;
    return result;
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto, files?: any[]) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { course: true },
    });
    if (!task) throw new HttpException('Завдання не знайдено', HttpStatus.NOT_FOUND);

    const course = await this.verifyTeacherWriteAccess(task.courseId, userId);

    if (dto.nusGroupId && dto.nusGroupId !== task.nusGroupId) {
      const nusGroup = await this.prisma.nusGroup.findUnique({
        where: { id: dto.nusGroupId },
      });
      if (!nusGroup) throw new HttpException('Групу НУШ не знайдено', HttpStatus.NOT_FOUND);
      if (nusGroup.subjectId !== course.subjectId) {
        throw new HttpException(
          'Помилка: Ця група результатів НУШ належить до іншого предмету!',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    let finalAttachments: string[] = [...task.attachments];

    if (dto.retainedAttachments !== undefined) {
      const retained = dto.retainedAttachments;

      const removedAttachments = task.attachments.filter((att) => !retained.includes(att));

      for (const removed of removedAttachments) {
        if (removed.includes('amazonaws.com')) {
          await this.awsS3Service.deleteFile(removed);
        }
      }
      finalAttachments = [...retained];
    }

    if (dto.links && dto.links.length > 0) {
      finalAttachments.push(...dto.links);
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const fileUrl = await this.awsS3Service.uploadFile(file, `courses/${task.courseId}/tasks`);
        finalAttachments.push(fileUrl);
      }
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title,
        description: dto.description,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        nusGroupId: dto.nusGroupId,
        courseModuleId: dto.courseModuleId !== undefined ? dto.courseModuleId : undefined,
        isHidden: dto.isHidden,
        attachments: finalAttachments,
      },
      include: { nusGroup: true, courseModule: true},
    });
  }

  async delete(userId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new HttpException('Завдання не знайдено', HttpStatus.NOT_FOUND);

    await this.verifyTeacherWriteAccess(task.courseId, userId);

    if (task.attachments && task.attachments.length > 0) {
      for (const fileUrl of task.attachments) {
        await this.awsS3Service.deleteFile(fileUrl);
      }
    }

    await this.prisma.task.delete({ where: { id: taskId } });
    return { message: 'Завдання та його файли успішно видалено' };
  }
}
