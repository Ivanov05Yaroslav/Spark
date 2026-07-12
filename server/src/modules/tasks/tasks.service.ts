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
      include: { coTeachers: true, subject: true, class: true },
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

  private async signAttachments(attachments: string[]) {
    return Promise.all(
      attachments.map(async (url) => {
        if (url.includes('amazonaws.com')) {
          return await this.awsS3Service.generatePresignedUrl(url);
        }
        return url;
      }),
    );
  }

  private async signCreatorAvatar(creator: any) {
    let avatarUrl = creator.avatarUrl;
    if (avatarUrl && avatarUrl.includes('amazonaws.com')) {
      avatarUrl = await this.awsS3Service.generatePresignedUrl(avatarUrl);
    }
    return { ...creator, avatarUrl };
  }

  async create(teacherId: string, dto: CreateTaskDto, files: any[]) {
    const course = await this.verifyTeacherWriteAccess(dto.courseId, teacherId);

    const lesson = await this.prisma.lesson.findUnique({ where: { id: dto.lessonId } });
    if (!lesson || lesson.courseId !== dto.courseId) {
      throw new HttpException(
        'Урок не знайдено, або він не належить до цього курсу',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.nusGroupIds && dto.nusGroupIds.length > 0) {
      const nusGroups = await this.prisma.nusGroup.findMany({
        where: { id: { in: dto.nusGroupIds } },
      });
      const invalidGroups = nusGroups.filter((g) => g.subjectId !== course.subjectId);
      if (invalidGroups.length > 0) {
        throw new HttpException(
          'Деякі групи результатів НУШ належать до іншого предмету!',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const attachments: string[] = [];

    if (dto.links && dto.links.length > 0) {
      attachments.push(...dto.links);
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const fileUrl = await this.awsS3Service.uploadFile(file, `courses/${dto.courseId}/tasks`);
        attachments.push(fileUrl);
      }
    }

    const task = await this.prisma.task.create({
      data: {
        courseId: dto.courseId,
        creatorId: teacherId,
        lessonId: lesson.id,
        courseModuleId: lesson.courseModuleId,
        title: dto.title,
        description: dto.description,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        isHidden: dto.isHidden || false,
        attachments,
        nusGroups:
          dto.nusGroupIds && dto.nusGroupIds.length > 0
            ? { connect: dto.nusGroupIds.map((id) => ({ id })) }
            : undefined,
      },
      include: { nusGroups: true },
    });

    const courseName = `${course.subject.name} ${course.class.name}`;
    const participants = await this.notificationsService.getCourseParticipants(
      dto.courseId,
      teacherId,
    );

    const notifications = participants.map((id) => ({
      senderId: teacherId,
      receiverId: id,
      title: 'Нове завдання',
      content: `Додано нове завдання: "${dto.title}" у курсі "${courseName}".`,
      type: 'TASK',
      metadata: { courseId: dto.courseId, taskId: task.id },
    }));

    await this.notificationsService.createMany(notifications);

    return {
      ...task,
      attachments: await this.signAttachments(task.attachments),
    };
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

    const tasks = await this.prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        nusGroups: true,
        courseModule: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
      },
    });

    return Promise.all(
      tasks.map(async (task) => ({
        ...task,
        creator: await this.signCreatorAvatar(task.creator),
        attachments: await this.signAttachments(task.attachments),
      })),
    );
  }

  async findOne(userId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        course: { include: { students: true, coTeachers: true, class: true } },
        creator: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        nusGroups: true,
        courseModule: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
      },
    });
    if (!task) throw new HttpException('Завдання не знайдено', HttpStatus.NOT_FOUND);

    const isTeacher =
      task.course.creatorId === userId ||
      task.course.coTeachers.some((ct) => ct.teacherId === userId);
    const isStudent = task.course.students.some((s) => s.studentId === userId);
    const isHomeroom = task.course.class.homeroomTeacherId === userId;

    if (!isTeacher && !isStudent && !isHomeroom) {
      throw new HttpException('Ви не є учасником цього курсу', HttpStatus.FORBIDDEN);
    }

    if (!isTeacher && task.isHidden) {
      throw new HttpException(
        'Доступ до цього завдання заборонено (воно приховане)',
        HttpStatus.FORBIDDEN,
      );
    }

    const { course: _, ...result } = task;

    return {
      ...result,
      creator: await this.signCreatorAvatar(result.creator),
      attachments: await this.signAttachments(result.attachments),
    };
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto, files?: any[]) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { course: { include: { subject: true, class: true } }, lesson: true },
    });
    if (!task) throw new HttpException('Завдання не знайдено', HttpStatus.NOT_FOUND);

    const course = await this.verifyTeacherWriteAccess(task.courseId, userId);

    if (dto.nusGroupIds && dto.nusGroupIds.length > 0) {
      const nusGroups = await this.prisma.nusGroup.findMany({
        where: { id: { in: dto.nusGroupIds } },
      });
      const invalidGroups = nusGroups.filter((g) => g.subjectId !== course.subjectId);
      if (invalidGroups.length > 0) {
        throw new HttpException(
          'Ця група результатів НУШ належить до іншого предмету!',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const finalAttachments: string[] = [];
    const retained = dto.retainedAttachments || [];
    const existingAwsUrls = task.attachments.filter((u) => u.includes('amazonaws.com'));

    const removedUrls = existingAwsUrls.filter((oldUrl) => {
      return !retained.some((rUrl) => {
        try {
          const rPath = new URL(rUrl).pathname;
          const oPath = new URL(oldUrl).pathname;
          return rPath === oPath;
        } catch {
          return rUrl === oldUrl;
        }
      });
    });

    for (const removed of removedUrls) {
      try {
        await this.awsS3Service.deleteFile(removed);
      } catch (e) {
        console.error('Помилка при видаленні файлу таски з S3', e);
      }
    }

    if (retained && retained.length > 0) {
      const cleanRetained = retained.map((url) => {
        if (url.includes('amazonaws.com')) {
          try {
            return new URL(url).pathname.substring(1);
          } catch {
            return url;
          }
        }
        return url;
      });
      finalAttachments.push(...cleanRetained);
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

    const isDeadlineChanged =
      dto.deadline && task.deadline && new Date(dto.deadline).getTime() !== task.deadline.getTime();

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title,
        description: dto.description,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        isHidden: dto.isHidden,
        attachments: finalAttachments,
        courseModuleId: task.lesson.courseModuleId,
        nusGroups: dto.nusGroupIds ? { set: dto.nusGroupIds.map((id) => ({ id })) } : undefined,
      },
      include: {
        nusGroups: true,
        courseModule: { select: { id: true, title: true, createdAt: true } },
      },
    });

    if (isDeadlineChanged && !updatedTask.isHidden) {
      const courseName = `${task.course.subject.name} ${task.course.class.name}`;
      const participants = await this.notificationsService.getCourseParticipants(
        updatedTask.courseId,
        userId,
      );

      const formattedDate = new Date(dto.deadline!).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });

      const notifications = participants.map((id) => ({
        senderId: userId,
        receiverId: id,
        title: 'Зміна дедлайну',
        content: `Змінено дедлайн для завдання "${updatedTask.title}" у курсі "${courseName}". Новий термін: ${formattedDate}.`,
        type: 'TASK',
        metadata: { courseId: updatedTask.courseId, taskId: updatedTask.id },
      }));
      await this.notificationsService.createMany(notifications);
    }

    return {
      ...updatedTask,
      attachments: await this.signAttachments(updatedTask.attachments),
    };
  }

  async delete(userId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new HttpException('Завдання не знайдено', HttpStatus.NOT_FOUND);

    await this.verifyTeacherWriteAccess(task.courseId, userId);

    if (task.attachments && task.attachments.length > 0) {
      const awsUrls = task.attachments.filter((url) => url.includes('amazonaws.com'));
      for (const url of awsUrls) {
        try {
          await this.awsS3Service.deleteFile(url);
        } catch (e) {
          console.error('Не вдалося видалити файл таски', e);
        }
      }
    }

    await this.prisma.task.delete({ where: { id: taskId } });
    return { message: 'Завдання успішно видалено' };
  }
}
