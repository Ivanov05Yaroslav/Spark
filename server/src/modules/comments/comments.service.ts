import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AwsS3Service } from '../../core/integrations/aws/aws-s3.service';
import { EmailService } from '../../core/integrations/email/email.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateCommentDto,
  ReportAction,
  ReportCommentDto,
  ResolveReportDto,
  UpdateCommentDto,
} from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly awsS3Service: AwsS3Service,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
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
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (user?.commentsBlockedUntil && new Date() < user.commentsBlockedUntil) {
      throw new HttpException(
        'Ваша можливість залишати коментарі тимчасово заблокована за порушення правил.',
        HttpStatus.FORBIDDEN,
      );
    }
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

  async updateComment(userId: string, commentId: string, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new HttpException('Коментар не знайдено', HttpStatus.NOT_FOUND);
    }

    if (comment.authorId !== userId) {
      throw new HttpException('Ви можете редагувати лише власні коментарі', HttpStatus.FORBIDDEN);
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: { content: dto.content },
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

    const { userRoles, ...authorRest } = updatedComment.author as any;
    return {
      ...updatedComment,
      author: {
        ...authorRest,
        roles: userRoles.map((ur: any) => ur.role.name),
        avatarUrl: await this.awsS3Service.generatePresignedUrl(authorRest.avatarUrl),
      },
    };
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

  async reportComment(userId: string, commentId: string, dto: ReportCommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: true },
    });

    if (!comment) throw new HttpException('Коментар не знайдено', HttpStatus.NOT_FOUND);
    if (comment.authorId === userId) {
      throw new HttpException(
        'Ви не можете поскаржитися на власний коментар',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.prisma.complaint.findFirst({
      where: { reporterId: userId, commentId: commentId },
    });
    if (existing) {
      throw new HttpException('Ви вже надіслали скаргу на цей коментар', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.complaint.create({
      data: {
        reporterId: userId,
        reportedUserId: comment.authorId,
        commentId: commentId,
        reason: dto.reason,
      },
    });

    return { message: 'Вашу скаргу успішно надіслано на розгляд модераторам' };
  }

  async getReports(moderatorId: string, query: any) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { commentId: { not: null } };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { comment: { content: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.complaint.count({ where }),
      this.prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              middleName: true,
              avatarUrl: true,
              userRoles: { include: { role: true } },
            },
          },
          reportedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              middleName: true,
              avatarUrl: true,
              userRoles: { include: { role: true } },
            },
          },
          comment: {
            select: { id: true, content: true, createdAt: true },
          },
        },
      }),
    ]);

    const formattedData = await Promise.all(
      data.map(async (report) => {
        let reporterAvatar = report.reporter.avatarUrl;
        let reportedUserAvatar = report.reportedUser.avatarUrl;

        if (reporterAvatar && reporterAvatar.includes('amazonaws.com')) {
          reporterAvatar = await this.awsS3Service.generatePresignedUrl(reporterAvatar);
        }
        if (reportedUserAvatar && reportedUserAvatar.includes('amazonaws.com')) {
          reportedUserAvatar = await this.awsS3Service.generatePresignedUrl(reportedUserAvatar);
        }

        const { userRoles: reporterRolesRaw, ...reporterRest } = report.reporter as any;
        const reporterRoles = reporterRolesRaw.map((ur: any) => ur.role.name);

        const { userRoles: reportedUserRolesRaw, ...reportedUserRest } = report.reportedUser as any;
        const reportedUserRoles = reportedUserRolesRaw.map((ur: any) => ur.role.name);

        return {
          id: report.id,
          reporterId: report.reporterId,
          reportedUserId: report.reportedUserId,
          commentId: report.commentId,
          reason: report.reason,
          status: report.status,
          createdAt: report.createdAt,
          updatedAt: report.updatedAt,
          reporter: {
            ...reporterRest,
            avatarUrl: reporterAvatar,
            roles: reporterRoles,
          },
          reportedUser: {
            ...reportedUserRest,
            avatarUrl: reportedUserAvatar,
            roles: reportedUserRoles,
          },
          comment: report.comment,
        };
      }),
    );

    return {
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async resolveReport(moderatorId: string, complaintId: string, dto: ResolveReportDto) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { reporter: true, reportedUser: true, comment: true },
    });

    if (!complaint) throw new HttpException('Скаргу не знайдено', HttpStatus.NOT_FOUND);
    if (complaint.status !== 'PENDING')
      throw new HttpException('Цю скаргу вже було оброблено', HttpStatus.BAD_REQUEST);

    const commentIdToDelete = complaint.commentId;

    if (dto.action === ReportAction.RESOLVE) {
      await this.prisma.complaint.update({
        where: { id: complaintId },
        data: {
          status: 'RESOLVED',
          commentId: null,
        },
      });

      if (commentIdToDelete) {
        await this.prisma.comment.delete({ where: { id: commentIdToDelete } }).catch(() => {});
      }

      await this.notificationsService.create({
        senderId: moderatorId,
        receiverId: complaint.reportedUserId,
        type: 'WARNING',
        title: 'Попередження про порушення',
        content:
          'Ваш коментар було видалено через порушення правил платформи. У разі повторних порушень вас може бути заблоковано.',
      });
      await this.emailService.sendMail(
        complaint.reportedUser.email,
        'Попередження про порушення',
        'Ваш коментар було видалено через порушення правил платформи.',
      );

      await this.notificationsService.create({
        senderId: moderatorId,
        receiverId: complaint.reporterId,
        type: 'INFO',
        title: 'Скаргу розглянуто',
        content:
          'Вашу скаргу було ухвалено. Порушника попереджено, а коментар видалено. Дякуємо за допомогу!',
      });
      await this.emailService.sendMail(
        complaint.reporter.email,
        'Скаргу розглянуто',
        'Вашу скаргу було ухвалено. Порушника попереджено.',
      );
    } else if (dto.action === ReportAction.REJECT) {
      await this.prisma.complaint.update({
        where: { id: complaintId },
        data: { status: 'REJECTED' },
      });

      await this.notificationsService.create({
        senderId: moderatorId,
        receiverId: complaint.reporterId,
        type: 'INFO',
        title: 'Скаргу відхилено',
        content: 'Модератори переглянули вашу скаргу і не знайшли порушень правил платформи.',
      });
      await this.emailService.sendMail(
        complaint.reporter.email,
        'Скаргу відхилено',
        'Модератори переглянули вашу скаргу і не знайшли порушень правил платформи.',
      );
    } else if (dto.action === ReportAction.BLOCK) {
      const blockUntil = new Date();
      blockUntil.setDate(blockUntil.getDate() + 7);

      await this.prisma.user.update({
        where: { id: complaint.reportedUserId },
        data: { commentsBlockedUntil: blockUntil },
      });

      await this.prisma.complaint.update({
        where: { id: complaintId },
        data: {
          status: 'BLOCKED',
          commentId: null,
        },
      });

      if (commentIdToDelete) {
        await this.prisma.comment.delete({ where: { id: commentIdToDelete } }).catch(() => {});
      }

      await this.notificationsService.create({
        senderId: moderatorId,
        receiverId: complaint.reportedUserId,
        type: 'WARNING',
        title: 'Блокування коментарів',
        content:
          'Через грубе порушення правил вам заблоковано можливість залишати коментарі на 7 днів.',
      });
      await this.emailService.sendMail(
        complaint.reportedUser.email,
        'Блокування коментарів',
        'Вам заблоковано можливість залишати коментарі на 7 днів.',
      );

      await this.notificationsService.create({
        senderId: moderatorId,
        receiverId: complaint.reporterId,
        type: 'INFO',
        title: 'Порушника покарано',
        content:
          'За вашою скаргою порушнику було заблоковано можливість писати коментарі на тиждень.',
      });
      await this.emailService.sendMail(
        complaint.reporter.email,
        'Порушника покарано',
        'За вашою скаргою порушнику було заблоковано можливість писати коментарі на тиждень.',
      );
    }

    return { message: 'Рішення по скарзі успішно застосовано' };
  }
}
