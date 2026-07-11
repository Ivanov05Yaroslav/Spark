import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AwsS3Service } from '../../core/integrations/aws/aws-s3.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTestDto, SubmitTestDto, UpdateTestDto } from './dto/test.dto';

@Injectable()
export class TestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly awsS3Service: AwsS3Service,
    private readonly notificationsService: NotificationsService,
  ) {}

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private calculateNusGrade(scored: number, max: number): number {
    if (max === 0) return 0;
    const grade = (scored / max) * 12;
    return Math.round(grade);
  }

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
        'У вас немає прав для роботи з тестами у цьому курсі',
        HttpStatus.FORBIDDEN,
      );
    }
    return course;
  }

  private async validateQuestionsNusGroups(questions: any[], subjectId: string) {
    const nusGroupIds = [...new Set(questions.map((q) => q.nusGroupId).filter(Boolean))];
    if (nusGroupIds.length > 0) {
      const nusGroups = await this.prisma.nusGroup.findMany({
        where: { id: { in: nusGroupIds } },
      });
      const invalidGroups = nusGroups.filter((g) => g.subjectId !== subjectId);
      if (invalidGroups.length > 0) {
        throw new HttpException(
          'Помилка: Деякі групи результатів НУШ у питаннях належать до іншого предмету!',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  private async signCreatorAvatar(creator: any) {
    let avatarUrl = creator.avatarUrl;
    if (avatarUrl && avatarUrl.includes('amazonaws.com')) {
      avatarUrl = await this.awsS3Service.generatePresignedUrl(avatarUrl);
    }
    return { ...creator, avatarUrl };
  }

  async createTest(teacherId: string, dto: CreateTestDto) {
    const course = await this.verifyTeacherWriteAccess(dto.courseId, teacherId);

    const lesson = await this.prisma.lesson.findUnique({ where: { id: dto.lessonId } });
    if (!lesson || lesson.courseId !== dto.courseId) {
      throw new HttpException(
        'Урок не знайдено, або він не належить до цього курсу',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.questions && dto.questions.length > 0) {
      await this.validateQuestionsNusGroups(dto.questions, course.subjectId);
    }

    const newTest = await this.prisma.test.create({
      data: {
        courseId: dto.courseId,
        creatorId: teacherId,
        lessonId: lesson.id,
        courseModuleId: lesson.courseModuleId,
        title: dto.title,
        timeLimitMinutes: dto.timeLimitMinutes,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        maxAttempts: dto.maxAttempts || 1,
        isResultHidden: dto.isResultHidden ?? false,
        isAttemptHidden: dto.isAttemptHidden ?? false,
        isShowCorrectAnswers: dto.isShowCorrectAnswers ?? true,
        isShuffleQuestions: dto.isShuffleQuestions ?? false,
        isShuffleAnswers: dto.isShuffleAnswers ?? false,
        isHidden: dto.isHidden ?? false,
        questions: {
          create:
            dto.questions?.map((q) => ({
              type: q.type,
              content: q.content,
              points: q.points,
              nusGroupId: q.nusGroupId || null,
              answers: {
                create: q.answers.map((a) => ({
                  content: a.content,
                  isCorrect: a.isCorrect,
                })),
              },
            })) || [],
        },
      },
    });

    const courseName = `${course.subject.name} ${course.class.name}`;
    const participants = await this.notificationsService.getCourseParticipants(
      dto.courseId,
      teacherId,
    );

    const notifications = participants.map((id) => ({
      senderId: teacherId,
      receiverId: id,
      title: 'Новий тест',
      content: `Додано новий тест: "${dto.title}" у курсі "${courseName}".`,
      type: 'TEST',
      metadata: { courseId: dto.courseId, testId: newTest.id },
    }));
    await this.notificationsService.createMany(notifications);

    return newTest;
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

    const tests = await this.prisma.test.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        _count: { select: { questions: true } },
        courseModule: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
      },
    });

    return Promise.all(
      tests.map(async (test) => ({
        ...test,
        creator: await this.signCreatorAvatar(test.creator),
      })),
    );
  }

  async getTestDetails(userId: string, testId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        course: { include: { students: true, coTeachers: true, class: true } },
        creator: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        courseModule: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
        questions: {
          include: { answers: true, nusGroup: true },
          orderBy: { id: 'asc' },
        },
      },
    });
    if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

    const creatorSigned = await this.signCreatorAvatar(test.creator);

    const isTeacher =
      test.course.creatorId === userId ||
      test.course.coTeachers.some((ct) => ct.teacherId === userId);

    if (!isTeacher) {
      const isStudent = test.course.students.some((s) => s.studentId === userId);
      const isHomeroom = test.course.class.homeroomTeacherId === userId;
      if (!isStudent && !isHomeroom) {
        throw new HttpException('У вас немає доступу до цього тесту', HttpStatus.FORBIDDEN);
      }
      if (test.isHidden) {
        throw new HttpException(
          'Доступ до цього тесту заборонено (він прихований)',
          HttpStatus.FORBIDDEN,
        );
      }

      let safeQuestions = test.questions.map((question) => {
        let processedAnswers = question.answers.map((answer) => {
          const { isCorrect, ...safeAnswer } = answer;
          return safeAnswer;
        });

        if (test.isShuffleAnswers) {
          processedAnswers = this.shuffleArray(processedAnswers);
        }

        return {
          ...question,
          answers: processedAnswers,
        };
      });

      if (test.isShuffleQuestions) {
        safeQuestions = this.shuffleArray(safeQuestions);
      }

      const { course: _, ...result } = test;
      return {
        ...result,
        creator: creatorSigned,
        questions: safeQuestions,
      };
    }
    const { course: _, ...result } = test;
    return {
      ...result,
      creator: creatorSigned,
    };
  }

  async updateTest(teacherId: string, testId: string, dto: UpdateTestDto) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: { include: { answers: true } },
        course: { include: { subject: true, class: true } },
        lesson: true,
      },
    });
    if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

    const course = await this.verifyTeacherWriteAccess(test.courseId, teacherId);

    if (dto.questions && dto.questions.length > 0) {
      await this.validateQuestionsNusGroups(dto.questions, course.subjectId);
    }

    const isDeadlineChanged =
      dto.deadline && test.deadline && new Date(dto.deadline).getTime() !== test.deadline.getTime();

    const updatedTest = await this.prisma.test.update({
      where: { id: testId },
      data: {
        courseModuleId: test.lesson.courseModuleId,
        title: dto.title,
        timeLimitMinutes: dto.timeLimitMinutes,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        maxAttempts: dto.maxAttempts,
        isResultHidden: dto.isResultHidden,
        isAttemptHidden: dto.isAttemptHidden,
        isShowCorrectAnswers: dto.isShowCorrectAnswers,
        isShuffleQuestions: dto.isShuffleQuestions,
        isShuffleAnswers: dto.isShuffleAnswers,
        isHidden: dto.isHidden,
      },
    });

    if (dto.questions) {
      const incomingQuestionIds = dto.questions.map((q) => q.id).filter(Boolean) as string[];
      const questionsToDelete = test.questions.filter((q) => !incomingQuestionIds.includes(q.id));

      if (questionsToDelete.length > 0) {
        await this.prisma.question.deleteMany({
          where: { id: { in: questionsToDelete.map((q) => q.id) } },
        });
      }

      for (const qDto of dto.questions) {
        if (qDto.id) {
          await this.prisma.question.update({
            where: { id: qDto.id },
            data: {
              type: qDto.type,
              content: qDto.content,
              points: qDto.points,
              nusGroupId: qDto.nusGroupId || null,
            },
          });

          const incomingAnswerIds = qDto.answers.map((a) => a.id).filter(Boolean) as string[];
          const existingQuestion = test.questions.find((q) => q.id === qDto.id);
          if (existingQuestion) {
            const answersToDelete = existingQuestion.answers.filter(
              (a) => !incomingAnswerIds.includes(a.id),
            );
            if (answersToDelete.length > 0) {
              await this.prisma.answer.deleteMany({
                where: { id: { in: answersToDelete.map((a) => a.id) } },
              });
            }
          }

          for (const aDto of qDto.answers) {
            if (aDto.id) {
              await this.prisma.answer.update({
                where: { id: aDto.id },
                data: { content: aDto.content, isCorrect: aDto.isCorrect },
              });
            } else {
              await this.prisma.answer.create({
                data: { questionId: qDto.id, content: aDto.content, isCorrect: aDto.isCorrect },
              });
            }
          }
        } else {
          await this.prisma.question.create({
            data: {
              testId,
              type: qDto.type,
              content: qDto.content,
              points: qDto.points,
              nusGroupId: qDto.nusGroupId || null,
              answers: {
                create: qDto.answers.map((a) => ({
                  content: a.content,
                  isCorrect: a.isCorrect,
                })),
              },
            },
          });
        }
      }
    }

    const isNowHidden = dto.isHidden !== undefined ? dto.isHidden : test.isHidden;
    if (isDeadlineChanged && !isNowHidden) {
      const courseName = `${test.course.subject.name} ${test.course.class.name}`;
      const participants = await this.notificationsService.getCourseParticipants(
        test.courseId,
        teacherId,
      );

      const formattedDate = new Date(dto.deadline!).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });

      const notifications = participants.map((id) => ({
        senderId: teacherId,
        receiverId: id,
        title: 'Зміна дедлайну',
        content: `Змінено дедлайн для тесту "${updatedTest.title}" у курсі "${courseName}". Новий термін: ${formattedDate}.`,
        type: 'TEST',
        metadata: { courseId: updatedTest.courseId, testId: updatedTest.id },
      }));
      await this.notificationsService.createMany(notifications);
    }

    return this.getTestDetails(teacherId, testId);
  }

  async submitTest(studentId: string, testId: string, dto: SubmitTestDto) {
    return this.prisma.$transaction(async (tx) => {
      const test = await tx.test.findUnique({
        where: { id: testId },
        include: {
          course: { include: { students: true } },
          questions: { include: { answers: true } },
        },
      });

      if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

      const isStudent = test.course.students.some((item) => item.studentId === studentId);
      if (!isStudent) {
        throw new HttpException('Ви не є учнем цього курсу', HttpStatus.FORBIDDEN);
      }

      const previousAttempts = await tx.submission.count({ where: { studentId, testId } });
      if (previousAttempts >= test.maxAttempts) {
        throw new HttpException('Вичерпано ліміт спроб', HttpStatus.FORBIDDEN);
      }

      const previousBest = await tx.submission.findFirst({
        where: { studentId, testId, finalGrade: { not: null } },
        orderBy: [{ finalGrade: 'desc' }, { submittedAt: 'asc' }],
        select: { id: true, finalGrade: true },
      });

      const stats: Record<string, { scored: number; max: number }> = {};
      let totalScoredOverall = 0;
      let totalMaxOverall = 0;

      for (const question of test.questions) {
        const selectedIds = dto.answers[question.id] ?? [];
        const questionMax = question.points;
        let questionScored = 0;

        if (question.type === 'ONE_CHOICE') {
          const selected = question.answers.find((answer) => answer.id === selectedIds[0]);
          if (selected?.isCorrect) questionScored = questionMax;
        } else if (question.type === 'MULTIPLE_CHOICE') {
          const correctAnswers = question.answers.filter((answer) => answer.isCorrect);
          const incorrectAnswers = question.answers.filter((answer) => !answer.isCorrect);

          const correctHits = selectedIds.filter((id) =>
            correctAnswers.some((answer) => answer.id === id),
          ).length;
          const incorrectHits = selectedIds.filter((id) =>
            incorrectAnswers.some((answer) => answer.id === id),
          ).length;

          const netHits = Math.max(0, correctHits - incorrectHits);
          if (correctAnswers.length > 0) {
            questionScored = (netHits / correctAnswers.length) * questionMax;
          }
        }

        totalScoredOverall += questionScored;
        totalMaxOverall += questionMax;

        const groupKey = question.nusGroupId ?? 'GENERAL';
        stats[groupKey] ??= { scored: 0, max: 0 };
        stats[groupKey].scored += questionScored;
        stats[groupKey].max += questionMax;
      }

      const rawScore = `${totalScoredOverall.toFixed(2)}/${totalMaxOverall.toFixed(2)}`;
      const finalGrade = this.calculateNusGrade(totalScoredOverall, totalMaxOverall);

      const testAnswersData: Array<{ questionId: string; answerId: string }> = [];
      for (const question of test.questions) {
        const allowedAnswerIds = new Set(question.answers.map((answer) => answer.id));
        for (const answerId of dto.answers[question.id] ?? []) {
          if (allowedAnswerIds.has(answerId)) {
            testAnswersData.push({ questionId: question.id, answerId });
          }
        }
      }

      const submission = await tx.submission.create({
        data: {
          testId,
          studentId,
          score: rawScore,
          finalGrade,
          duration: dto.duration,
          checkedAt: new Date(),
          attachments: [],
          testAnswers: { create: testAnswersData },
        },
      });

      const isBestAttempt =
        previousBest?.finalGrade === null ||
        previousBest?.finalGrade === undefined ||
        finalGrade >= previousBest.finalGrade;

      if (isBestAttempt) {
        await tx.gradebook.deleteMany({ where: { studentId, testId } });

        const projection = Object.entries(stats)
          .filter(([, stat]) => stat.max > 0)
          .map(([groupId, stat]) => ({
            studentId,
            teacherId: test.creatorId,
            courseId: test.courseId,
            lessonId: test.lessonId,
            taskId: null,
            testId: test.id,
            nusGroupId: groupId === 'GENERAL' ? null : groupId,
            gradeType: groupId === 'GENERAL' ? 'TRADITIONAL' : 'NUS',
            score: this.calculateNusGrade(stat.scored, stat.max),
            date: new Date(),
          }));

        if (projection.length > 0) {
          await tx.gradebook.createMany({ data: projection });
        }
      }

      return { ...submission, isBestAttempt };
    });
  }

  async deleteTest(teacherId: string, testId: string) {
    const test = await this.prisma.test.findUnique({ where: { id: testId } });
    if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

    await this.verifyTeacherWriteAccess(test.courseId, teacherId);
    await this.prisma.test.delete({ where: { id: testId } });

    return { message: 'Тест успішно видалено' };
  }
}
