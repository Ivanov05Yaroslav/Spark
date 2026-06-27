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

  async getSubmissionForTask(userId: string, taskId: string, targetStudentId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { course: { include: { students: true, coTeachers: true } } },
    });

    if (!task) throw new HttpException('Завдання не знайдено', HttpStatus.NOT_FOUND);

    let hasAccess = false;
    if (userId === targetStudentId) {
      hasAccess = true;
    } else {
      const isTeacher =
        task.course.creatorId === userId ||
        task.course.coTeachers.some((ct) => ct.teacherId === userId);
      if (isTeacher) {
        hasAccess = true;
      } else {
        const parentRel = await this.prisma.studentParent.findUnique({
          where: { studentId_parentId: { studentId: targetStudentId, parentId: userId } },
        });
        if (parentRel) hasAccess = true;
      }
    }

    if (!hasAccess) {
      throw new HttpException('У вас немає доступу до цієї роботи', HttpStatus.FORBIDDEN);
    }

    const isStudentEnrolled = task.course.students.some((s) => s.studentId === targetStudentId);
    if (!isStudentEnrolled) {
      throw new HttpException('Учень не є учасником цього курсу', HttpStatus.FORBIDDEN);
    }

    const submission = await this.prisma.submission.findFirst({
      where: { taskId, studentId: targetStudentId },
    });

    if (!submission) return null;

    const signedAttachments = await Promise.all(
      submission.attachments.map(async (url) => {
        if (url.includes('amazonaws.com')) {
          return await this.awsS3Service.generatePresignedUrl(url);
        }
        return url;
      }),
    );

    return { ...submission, attachments: signedAttachments };
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

  async getTestAttemptReview(userId: string, submissionId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        test: {
          include: {
            course: { include: { coTeachers: true } },
            questions: { include: { answers: true } },
          },
        },
        testAnswers: true,
      },
    });

    if (!submission || !submission.test) {
      throw new HttpException('Спробу або тест не знайдено', HttpStatus.NOT_FOUND);
    }

    const test = submission.test;
    const isTeacher =
      test.course.creatorId === userId ||
      test.course.coTeachers.some((ct) => ct.teacherId === userId);
    const isOwner = submission.studentId === userId;

    let hasAccess = false;
    if (isTeacher || isOwner) {
      hasAccess = true;
    } else {
      const parentRel = await this.prisma.studentParent.findUnique({
        where: { studentId_parentId: { studentId: submission.studentId, parentId: userId } },
      });
      if (parentRel) hasAccess = true;
    }

    if (!hasAccess) {
      throw new HttpException('У вас немає доступу до цієї спроби', HttpStatus.FORBIDDEN);
    }

    if (!isTeacher) {
      if (test.isAttemptHidden) {
        throw new HttpException(
          'Перегляд деталей спроби заборонено налаштуваннями тесту',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    const review = {
      id: submission.id,
      studentId: submission.studentId,
      submittedAt: submission.submittedAt,
      duration: submission.duration,
      totalScore: isTeacher || !test.isResultHidden ? submission.score : null,
      questions: test.questions.map((q) => {
        const studentChoices = submission.testAnswers
          .filter((ans) => ans.questionId === q.id)
          .map((ans) => ans.answerId);

        let earnedPoints = 0;
        if (q.type === 'ONE_CHOICE') {
          const answer = q.answers.find((a) => a.id === studentChoices[0]);
          if (answer?.isCorrect) earnedPoints = q.points;
        } else {
          const correctAnswers = q.answers.filter((a) => a.isCorrect);
          const incorrectAnswers = q.answers.filter((a) => !a.isCorrect);
          let correctHits = 0;
          let incorrectHits = 0;
          studentChoices.forEach((id) => {
            if (correctAnswers.some((a) => a.id === id)) correctHits++;
            if (incorrectAnswers.some((a) => a.id === id)) incorrectHits++;
          });
          const netHits = Math.max(0, correctHits - incorrectHits);
          if (correctAnswers.length > 0) {
            earnedPoints = Number(((netHits / correctAnswers.length) * q.points).toFixed(2));
          }
        }

        return {
          id: q.id,
          content: q.content,
          type: q.type,
          maxPoints: q.points,
          earnedPoints: isTeacher || test.isShowCorrectAnswers ? earnedPoints : null,
          answers: q.answers.map((a) => ({
            id: a.id,
            content: a.content,
            isSelectedByStudent: studentChoices.includes(a.id),
            isCorrect: isTeacher || test.isShowCorrectAnswers ? a.isCorrect : undefined,
          })),
        };
      }),
    };

    return review;
  }

  async getTestAttempts(userId: string, testId: string, targetStudentId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: { course: { include: { coTeachers: true } } },
    });

    if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

    let hasAccess = false;
    const isTeacher =
      test.course.creatorId === userId ||
      test.course.coTeachers.some((ct) => ct.teacherId === userId);

    if (userId === targetStudentId) {
      hasAccess = true;
    } else if (isTeacher) {
      hasAccess = true;
    } else {
      const parentRel = await this.prisma.studentParent.findUnique({
        where: { studentId_parentId: { studentId: targetStudentId, parentId: userId } },
      });
      if (parentRel) hasAccess = true;
    }

    if (!hasAccess) {
      throw new HttpException('У вас немає доступу до спроб цього учня', HttpStatus.FORBIDDEN);
    }

    const submissions = await this.prisma.submission.findMany({
      where: { testId, studentId: targetStudentId },
      orderBy: { submittedAt: 'asc' },
    });

    return {
      testTitle: test.title,
      maxAttempts: test.maxAttempts,
      usedAttempts: submissions.length,
      attempts: submissions.map((sub, index) => ({
        id: sub.id,
        attemptNumber: index + 1,
        submittedAt: sub.submittedAt,
        duration: sub.duration,
        score: !isTeacher && test.isResultHidden ? null : sub.score,
        canReview: isTeacher || !test.isAttemptHidden,
      })),
    };
  }

  async getStudentSubmissionsByTask(teacherId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        course: {
          include: {
            coTeachers: true,
            students: { include: { student: true } },
          },
        },
      },
    });

    if (!task) throw new HttpException('Завдання не знайдено', HttpStatus.NOT_FOUND);

    const isTeacher =
      task.course.creatorId === teacherId ||
      task.course.coTeachers.some((ct) => ct.teacherId === teacherId);

    if (!isTeacher) {
      throw new HttpException('У вас немає прав переглядати роботи учнів', HttpStatus.FORBIDDEN);
    }

    const allSubmissions = await this.prisma.submission.findMany({
      where: { taskId },
      orderBy: { submittedAt: 'desc' },
    });

    const studentsWithSubmissions = await Promise.all(
      task.course.students.map(async (studentEnrollment) => {
        const student = studentEnrollment.student;
        const studentSubmissions = allSubmissions.filter((sub) => sub.studentId === student.id);
        const latestSubmission = studentSubmissions.length > 0 ? studentSubmissions[0] : null;

        let avatarUrl = student.avatarUrl;
        if (avatarUrl && avatarUrl.includes('amazonaws.com')) {
          avatarUrl = await this.awsS3Service.generatePresignedUrl(avatarUrl);
        }

        let signedAttachments: string[] = [];
        if (latestSubmission && latestSubmission.attachments.length > 0) {
          signedAttachments = await Promise.all(
            latestSubmission.attachments.map(async (url) => {
              if (url.includes('amazonaws.com')) {
                return await this.awsS3Service.generatePresignedUrl(url);
              }
              return url;
            }),
          );
        }

        return {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          middleName: student.middleName,
          avatarUrl,
          submissionId: latestSubmission?.id || null,
          submittedAt: latestSubmission?.submittedAt || null,
          checkedAt: latestSubmission?.checkedAt || null,
          score: latestSubmission?.score || null,
          attachments: signedAttachments,
          status: latestSubmission
            ? latestSubmission.checkedAt
              ? 'GRADED'
              : 'SUBMITTED'
            : 'NOT_SUBMITTED',
        };
      }),
    );

    return studentsWithSubmissions.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }

  async getStudentAttemptsByTest(teacherId: string, testId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        course: {
          include: {
            coTeachers: true,
            students: { include: { student: true } },
          },
        },
      },
    });

    if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

    const isTeacher =
      test.course.creatorId === teacherId ||
      test.course.coTeachers.some((ct) => ct.teacherId === teacherId);

    if (!isTeacher) {
      throw new HttpException('У вас немає прав переглядати спроби учнів', HttpStatus.FORBIDDEN);
    }

    const allSubmissions = await this.prisma.submission.findMany({
      where: { testId },
      orderBy: { submittedAt: 'asc' },
    });

    const studentsWithAttempts = await Promise.all(
      test.course.students.map(async (studentEnrollment) => {
        const student = studentEnrollment.student;
        const studentSubmissions = allSubmissions.filter((sub) => sub.studentId === student.id);

        let avatarUrl = student.avatarUrl;
        if (avatarUrl && avatarUrl.includes('amazonaws.com')) {
          avatarUrl = await this.awsS3Service.generatePresignedUrl(avatarUrl);
        }

        let highestScore: number | null = null;
        if (studentSubmissions.length > 0) {
          const scores = studentSubmissions
            .map((sub) => parseFloat(sub.score || '0'))
            .filter((score) => !isNaN(score));
          if (scores.length > 0) {
            highestScore = Math.max(...scores);
          }
        }

        return {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          middleName: student.middleName,
          avatarUrl,
          highestScore: highestScore !== null ? highestScore.toString() : null,
          attemptsCount: studentSubmissions.length,
          maxAttempts: test.maxAttempts,
          attempts: studentSubmissions.map((sub, index) => ({
            id: sub.id,
            attemptNumber: index + 1,
            submittedAt: sub.submittedAt,
            duration: sub.duration,
            score: sub.score,
          })),
        };
      }),
    );

    return studentsWithAttempts.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }
}
