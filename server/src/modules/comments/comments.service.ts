import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AwsS3Service } from '../../core/integrations/aws/aws-s3.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  private async getContext(dto: { taskId?: string; testId?: string }) {
    if (dto.taskId && dto.testId) {
      throw new HttpException(
        "Коментар може бути прив'язаний або до завдання, або до тесту, але не до обох одночасно",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: dto.taskId },
        include: { course: { include: { coTeachers: true, students: true } } },
      });
      if (!task) throw new HttpException('Завдання не знайдено', HttpStatus.NOT_FOUND);
      return { entity: task, course: task.course, title: 'Коментар до завдання' };
    }

    if (dto.testId) {
      const test = await this.prisma.test.findUnique({
        where: { id: dto.testId },
        include: { course: { include: { coTeachers: true, students: true } } },
      });
      if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);
      return { entity: test, course: test.course, title: 'Коментар до тесту' };
    }

    throw new HttpException('Не вказано taskId або testId', HttpStatus.BAD_REQUEST);
  }

  async createComment(userId: string, dto: CreateCommentDto) {
    const { course, title } = await this.getContext(dto);

    const isTeacher =
      course.creatorId === userId || course.coTeachers.some((ct) => ct.teacherId === userId);
    const isStudent = course.students.some((s) => s.studentId === userId);

    if (!isTeacher && !isStudent) {
      throw new HttpException('У вас немає доступу до цього курсу', HttpStatus.FORBIDDEN);
    }

    let finalTargetStudentId = dto.targetStudentId;
    let notificationReceiverId: string | null = null;

    if (isStudent) {
      finalTargetStudentId = userId;
      notificationReceiverId = course.creatorId;
    } else if (isTeacher) {
      if (!dto.targetStudentId) {
        throw new HttpException(
          'Вчитель повинен вказати targetStudentId учня',
          HttpStatus.BAD_REQUEST,
        );
      }
      const targetIsEnrolled = course.students.some((s) => s.studentId === dto.targetStudentId);
      if (!targetIsEnrolled) {
        throw new HttpException('Цей учень не є учасником курсу', HttpStatus.BAD_REQUEST);
      }
      finalTargetStudentId = dto.targetStudentId;
      notificationReceiverId = finalTargetStudentId;
    }

    const comment = await this.prisma.comment.create({
      data: {
        authorId: userId,
        targetStudentId: finalTargetStudentId!,
        content: dto.content,
        taskId: dto.taskId,
        testId: dto.testId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            avatarUrl: true,
            userRoles: { include: { role: true } },
          },
        },
      },
    });

    if (notificationReceiverId && notificationReceiverId !== userId) {
      await this.notificationsService.create({
        senderId: userId,
        receiverId: notificationReceiverId,
        title,
        content: `Приватне повідомлення: "${dto.content.substring(0, 50)}..."`,
        type: 'COMMENT',
      });
    }

    const { userRoles, ...authorRest } = comment.author as any;

    return {
      ...comment,
      author: {
        ...authorRest,
        roles: userRoles.map((ur: any) => ur.role.name),
        avatarUrl: await this.awsS3Service.generatePresignedUrl(authorRest.avatarUrl),
      },
    };
  }

  async getComments(
    userId: string,
    entityType: 'task' | 'test',
    entityId: string,
    targetStudentId?: string,
  ) {
    const dto = { [`${entityType}Id`]: entityId };
    const { course } = await this.getContext(dto);

    const isTeacher =
      course.creatorId === userId || course.coTeachers.some((ct) => ct.teacherId === userId);
    const isStudent = course.students.some((s) => s.studentId === userId);

    if (!isTeacher && !isStudent) {
      throw new HttpException('У вас немає доступу до цього курсу', HttpStatus.FORBIDDEN);
    }

    let filterTargetId = userId;

    if (isTeacher) {
      if (!targetStudentId) {
        throw new HttpException(
          'Для перегляду гілки вчитель має передати targetStudentId учня',
          HttpStatus.BAD_REQUEST,
        );
      }
      filterTargetId = targetStudentId;
    }

    const comments = await this.prisma.comment.findMany({
      where: {
        ...dto,
        targetStudentId: filterTargetId,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            avatarUrl: true,
            userRoles: { include: { role: true } },
          },
        },
      },
    });

    return Promise.all(
      comments.map(async (comment) => {
        const { userRoles, ...authorRest } = comment.author as any;
        return {
          ...comment,
          author: {
            ...authorRest,
            roles: userRoles.map((ur: any) => ur.role.name),
            avatarUrl: await this.awsS3Service.generatePresignedUrl(authorRest.avatarUrl),
          },
        };
      }),
    );
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new HttpException('Коментар не знайдено', HttpStatus.NOT_FOUND);

    if (comment.authorId !== userId) {
      throw new HttpException('Ви можете видаляти лише власні коментарі', HttpStatus.FORBIDDEN);
    }

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Коментар успішно видалено' };
  }
}
