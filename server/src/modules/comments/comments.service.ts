import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async verifyAccessToSubmission(userId: string, submissionId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        task: { include: { course: { include: { coTeachers: true } } } },
        test: { include: { course: { include: { coTeachers: true } } } },
      },
    });

    if (!submission) throw new HttpException('Здану роботу не знайдено', HttpStatus.NOT_FOUND);

    const course = submission.task?.course || submission.test?.course;
    if (!course)
      throw new HttpException('Помилка структури курсу', HttpStatus.INTERNAL_SERVER_ERROR);

    const isStudentOwner = submission.studentId === userId;
    const isTeacher =
      course.creatorId === userId || course.coTeachers.some((ct) => ct.teacherId === userId);

    if (!isStudentOwner && !isTeacher) {
      throw new HttpException(
        'У вас немає доступу до обговорення цієї роботи',
        HttpStatus.FORBIDDEN,
      );
    }

    return submission;
  }

  async createComment(userId: string, dto: CreateCommentDto) {
    const submission = await this.verifyAccessToSubmission(userId, dto.submissionId);

    const comment = await this.prisma.comment.create({
      data: {
        submissionId: dto.submissionId,
        authorId: userId,
        content: dto.content,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    const creatorId = submission.task?.course?.creatorId ?? submission.test?.course?.creatorId;
    if (!creatorId) {
      throw new HttpException('Помилка структури курсу', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const receiverId = userId === submission.studentId ? creatorId : submission.studentId;

    await this.notificationsService.create({
      senderId: userId,
      receiverId,
      title: 'Новий коментар',
      content: `Ви отримали новий коментар до роботи`,
      type: 'COMMENT',
    });

    return comment;
  }

  async getCommentsBySubmission(userId: string, submissionId: string) {
    await this.verifyAccessToSubmission(userId, submissionId);

    return this.prisma.comment.findMany({
      where: { submissionId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            userRoles: { include: { role: true } },
          },
        },
      },
    });
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
    return { message: 'Коментар видалено' };
  }
}
