import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AwsS3Service } from '../../core/integrations/aws/aws-s3.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GetSubmissionsQueryDto } from './dto/submission-query.dto';
import {
  CreateTaskSubmissionDto,
  GradeSubmissionDto,
  UpdateTaskSubmissionDto,
} from './dto/submission.dto';

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly awsS3Service: AwsS3Service,
    private readonly notificationsService: NotificationsService,
  ) {}

  async submitTask(studentId: string, dto: CreateTaskSubmissionDto, files?: any[]) {
    const task = await this.prisma.task.findUnique({
      where: { id: dto.taskId },
      include: { course: { include: { students: true } } },
    });
    if (!task) throw new HttpException('Завдання не знайдено', HttpStatus.NOT_FOUND);

    const isStudent = task.course.students.some((s) => s.studentId === studentId);
    if (!isStudent)
      throw new HttpException('Ви не можете здати роботу до чужого курсу', HttpStatus.FORBIDDEN);

    const hasFiles = files && files.length > 0;
    const hasLinks = dto.links && dto.links.length > 0;
    if (!hasFiles && !hasLinks) {
      throw new HttpException('Робота не може бути порожньою', HttpStatus.BAD_REQUEST);
    }

    const existing = await this.prisma.submission.findFirst({
      where: { taskId: dto.taskId, studentId },
    });
    if (existing) {
      throw new HttpException(
        'Ви вже здали цю роботу. Використовуйте редагування.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const attachments: string[] = [];
    if (hasFiles) {
      for (const file of files) {
        const url = await this.awsS3Service.uploadFile(file, `submissions/tasks/${dto.taskId}`);
        attachments.push(url);
      }
    }
    if (hasLinks) attachments.push(...(dto.links ?? []));

    return this.prisma.submission.create({
      data: {
        taskId: dto.taskId,
        studentId,
        attachments,
      },
    });
  }

  private paginateResponse(data: any[], total: number, page: number, limit: number) {
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSubmissionsByTask(teacherId: string, taskId: string, query: GetSubmissionsQueryDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { course: { include: { coTeachers: true } } },
    });
    if (!task) throw new HttpException('Завдання не знайдено', HttpStatus.NOT_FOUND);

    const isTeacher =
      task.course.creatorId === teacherId ||
      task.course.coTeachers.some((ct) => ct.teacherId === teacherId);
    if (!isTeacher)
      throw new HttpException('У вас немає прав для перегляду цих робіт', HttpStatus.FORBIDDEN);

    const {
      page = 1,
      limit = 10,
      search,
      isGraded,
      sortBy = 'submittedAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { taskId };

    if (isGraded !== undefined) {
      where.checkedAt = isGraded ? { not: null } : null;
    }

    if (search) {
      where.student = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [total, data] = await Promise.all([
      this.prisma.submission.count({ where }),
      this.prisma.submission.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return this.paginateResponse(data, total, page, limit);
  }

  async getSubmissionsByTest(teacherId: string, testId: string, query: GetSubmissionsQueryDto) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: { course: { include: { coTeachers: true } } },
    });
    if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

    const isTeacher =
      test.course.creatorId === teacherId ||
      test.course.coTeachers.some((ct) => ct.teacherId === teacherId);
    if (!isTeacher) throw new HttpException('У вас немає прав', HttpStatus.FORBIDDEN);

    const {
      page = 1,
      limit = 10,
      search,
      isGraded,
      sortBy = 'submittedAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { testId };
    if (isGraded !== undefined) where.checkedAt = isGraded ? { not: null } : null;
    if (search) {
      where.student = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [total, data] = await Promise.all([
      this.prisma.submission.count({ where }),
      this.prisma.submission.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return this.paginateResponse(data, total, page, limit);
  }

  async getUngradedSubmissionsByCourse(teacherId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { coTeachers: true },
    });
    if (!course) throw new HttpException('Курс не знайдено', HttpStatus.NOT_FOUND);

    const isTeacher =
      course.creatorId === teacherId || course.coTeachers.some((ct) => ct.teacherId === teacherId);
    if (!isTeacher)
      throw new HttpException('У вас немає прав для перегляду цього курсу', HttpStatus.FORBIDDEN);

    return this.prisma.submission.findMany({
      where: {
        OR: [{ task: { courseId } }, { test: { courseId } }],
        checkedAt: null,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        task: { select: { id: true, title: true } },
        test: { select: { id: true, title: true } },
      },
      orderBy: { submittedAt: 'asc' },
    });
  }

  async getStudentSubmissionsByCourse(userId: string, courseId: string, studentId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { coTeachers: true },
    });
    if (!course) throw new HttpException('Курс не знайдено', HttpStatus.NOT_FOUND);

    const isTeacher =
      course.creatorId === userId || course.coTeachers.some((ct) => ct.teacherId === userId);
    const isSelf = userId === studentId;

    if (!isTeacher && !isSelf) {
      throw new HttpException(
        'У вас немає прав для перегляду робіт цього учня',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.prisma.submission.findMany({
      where: {
        studentId,
        OR: [{ task: { courseId } }, { test: { courseId } }],
      },
      include: {
        task: { select: { id: true, title: true } },
        test: { select: { id: true, title: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async updateTaskSubmission(
    studentId: string,
    submissionId: string,
    dto: UpdateTaskSubmissionDto,
    files?: any[],
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });
    if (!submission || submission.studentId !== studentId) {
      throw new HttpException('Роботу не знайдено або у вас немає доступу', HttpStatus.NOT_FOUND);
    }

    const retainedCount = dto.retainedAttachments?.length || 0;
    const linksCount = dto.links?.length || 0;
    const filesCount = files?.length || 0;

    if (retainedCount + linksCount + filesCount === 0) {
      throw new HttpException('Оновлена робота не може бути порожньою', HttpStatus.BAD_REQUEST);
    }

    let finalAttachments: string[] = [...submission.attachments];
    const retainedAttachments = dto.retainedAttachments ?? [];

    if (dto.retainedAttachments !== undefined) {
      const removed = submission.attachments.filter((att) => !retainedAttachments.includes(att));
      for (const r of removed) {
        if (r.includes('amazonaws.com')) await this.awsS3Service.deleteFile(r);
      }
      finalAttachments = [...retainedAttachments];
    }

    if (dto.links) finalAttachments.push(...dto.links);

    if (files && files.length > 0) {
      for (const file of files) {
        const url = await this.awsS3Service.uploadFile(
          file,
          `submissions/tasks/${submission.taskId}`,
        );
        finalAttachments.push(url);
      }
    }

    return this.prisma.submission.update({
      where: { id: submissionId },
      data: { attachments: finalAttachments },
    });
  }

  async deleteSubmission(studentId: string, submissionId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });
    if (!submission || submission.studentId !== studentId) {
      throw new HttpException('Роботу не знайдено або у вас немає доступу', HttpStatus.NOT_FOUND);
    }

    for (const url of submission.attachments) {
      if (url.includes('amazonaws.com')) await this.awsS3Service.deleteFile(url);
    }

    await this.prisma.submission.delete({ where: { id: submissionId } });
    return { message: 'Здану роботу успішно видалено' };
  }

  async gradeSubmission(teacherId: string, submissionId: string, dto: GradeSubmissionDto) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        task: { include: { course: { include: { coTeachers: true } } } },
        test: { include: { course: { include: { coTeachers: true } } } },
      },
    });
    if (!submission) throw new HttpException('Роботу не знайдено', HttpStatus.NOT_FOUND);

    const course = submission.task?.course || submission.test?.course;
    if (!course)
      throw new HttpException('Помилка структури курсу', HttpStatus.INTERNAL_SERVER_ERROR);

    const isTeacher =
      course.creatorId === teacherId || course.coTeachers?.some((ct) => ct.teacherId === teacherId);
    if (!isTeacher)
      throw new HttpException('У вас немає прав для оцінювання цієї роботи', HttpStatus.FORBIDDEN);

    const updated = await this.prisma.submission.update({
      where: { id: submissionId },
      data: { score: dto.score, checkedAt: new Date() },
    });

    if (submission.task) {
      await this.notificationsService.create({
        senderId: teacherId,
        receiverId: submission.studentId,
        title: 'Оцінка за завдання',
        content: `Вашу роботу "${submission.task.title}" перевірено. Оцінка: ${dto.score}`,
        type: 'GRADE',
      });
    }

    return updated;
  }
}
