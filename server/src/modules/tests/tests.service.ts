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

  private async getOrCreateModuleId(courseId: string, moduleId?: string, newTitle?: string) {
    if (!moduleId && (!newTitle || newTitle.trim() === '')) {
      throw new HttpException(
        "Тест обов'язково має належати до модуля (теми)",
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

  private async signCreatorAvatar(creator: any) {
    let avatarUrl = creator.avatarUrl;
    if (avatarUrl && avatarUrl.includes('amazonaws.com')) {
      avatarUrl = await this.awsS3Service.generatePresignedUrl(avatarUrl);
    }
    return { ...creator, avatarUrl };
  }

  async createTest(teacherId: string, dto: CreateTestDto) {
    const course = await this.verifyTeacherWriteAccess(dto.courseId, teacherId);
    const finalModuleId = await this.getOrCreateModuleId(
      dto.courseId,
      dto.courseModuleId,
      dto.newModuleTitle,
    );

    const newTest = await this.prisma.test.create({
      data: {
        courseId: dto.courseId,
        creatorId: teacherId,
        nusGroupId: dto.nusGroupId,
        courseModuleId: finalModuleId,
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
        nusGroup: true,
        courseModule: { select: { id: true, title: true } },
        questions: {
          include: { answers: true },
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

      const safeQuestions = test.questions.map((question) => ({
        ...question,
        answers: question.answers.map((answer) => {
          const { isCorrect, ...safeAnswer } = answer;
          return safeAnswer;
        }),
      }));

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
      include: { course: { include: { subject: true, class: true } } },
    });
    if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

    await this.verifyTeacherWriteAccess(test.courseId, teacherId);

    const isDeadlineChanged =
      dto.deadline && test.deadline && new Date(dto.deadline).getTime() !== test.deadline.getTime();

    const finalModuleId = await this.getOrCreateModuleId(
      test.courseId,
      (dto.courseModuleId !== undefined ? dto.courseModuleId : test.courseModuleId) || undefined,
      dto.newModuleTitle,
    );

    await this.prisma.test.update({
      where: { id: testId },
      data: {
        nusGroupId: dto.nusGroupId,
        courseModuleId: finalModuleId,
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

      await this.prisma.question.deleteMany({
        where: {
          testId: testId,
          id: { notIn: incomingQuestionIds },
        },
      });

      for (const q of dto.questions) {
        if (q.id) {
          const incomingAnswerIds = q.answers.map((a) => a.id).filter(Boolean) as string[];
          await this.prisma.answer.deleteMany({
            where: {
              questionId: q.id,
              id: { notIn: incomingAnswerIds },
            },
          });

          await this.prisma.question.update({
            where: { id: q.id },
            data: {
              content: q.content,
              points: q.points,
            },
          });

          for (const a of q.answers) {
            if (a.id) {
              await this.prisma.answer.update({
                where: { id: a.id },
                data: { content: a.content, isCorrect: a.isCorrect },
              });
            } else {
              await this.prisma.answer.create({
                data: {
                  questionId: q.id,
                  content: a.content,
                  isCorrect: a.isCorrect,
                },
              });
            }
          }
        } else {
          await this.prisma.question.create({
            data: {
              testId: testId,
              type: q.type,
              content: q.content,
              points: q.points,
              answers: {
                create: q.answers.map((a) => ({
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
        content: `Змінено дедлайн для тесту "${dto.title || test.title}" у курсі "${courseName}". Новий термін: ${formattedDate}.`,
        type: 'TEST',
        metadata: { courseId: test.courseId, testId: test.id },
      }));
      await this.notificationsService.createMany(notifications);
    }

    return this.getTestDetails(teacherId, testId);
  }

  async deleteTest(teacherId: string, testId: string) {
    const test = await this.prisma.test.findUnique({ where: { id: testId } });
    if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

    await this.verifyTeacherWriteAccess(test.courseId, teacherId);
    await this.prisma.test.delete({ where: { id: testId } });
    return { message: 'Тест успішно видалено' };
  }

  // async addQuestion(teacherId: string, testId: string, dto: CreateQuestionDto) {
  //   const test = await this.prisma.test.findUnique({ where: { id: testId } });
  //   if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

  //   await this.verifyTeacherWriteAccess(test.courseId, teacherId);

  //   if (dto.type === QuestionType.ONE_CHOICE) {
  //     if (dto.answers.length !== 4) {
  //       throw new HttpException(
  //         'Для питання з однією правильною відповіддю має бути рівно 4 варіанти',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //     const correctAnswersCount = dto.answers.filter((a) => a.isCorrect).length;
  //     if (correctAnswersCount !== 1) {
  //       throw new HttpException(
  //         'Для цього типу питання має бути рівно 1 правильна відповідь',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //   }

  //   return this.prisma.question.create({
  //     data: {
  //       testId: testId,
  //       type: dto.type,
  //       content: dto.content,
  //       points: dto.points,
  //       answers: {
  //         create: dto.answers.map((a) => ({
  //           content: a.content,
  //           isCorrect: a.isCorrect,
  //         })),
  //       },
  //     },
  //     include: { answers: true },
  //   });
  // }

  // async addQuestionsBulk(teacherId: string, testId: string, dto: BulkCreateQuestionDto) {
  //   const test = await this.prisma.test.findUnique({ where: { id: testId } });
  //   if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

  //   await this.verifyTeacherWriteAccess(test.courseId, teacherId);

  //   for (const [index, q] of dto.questions.entries()) {
  //     if (q.type === QuestionType.ONE_CHOICE) {
  //       if (q.answers.length !== 4) {
  //         throw new HttpException(
  //           `Питання №${index + 1} ("${q.content}") має містити рівно 4 варіанти відповіді`,
  //           HttpStatus.BAD_REQUEST,
  //         );
  //       }
  //       const correctAnswersCount = q.answers.filter((a) => a.isCorrect).length;
  //       if (correctAnswersCount !== 1) {
  //         throw new HttpException(
  //           `Питання №${index + 1} ("${q.content}") має містити рівно 1 правильну відповідь`,
  //           HttpStatus.BAD_REQUEST,
  //         );
  //       }
  //     }
  //   }

  //   const createdQuestions = await this.prisma.$transaction(
  //     dto.questions.map((q) =>
  //       this.prisma.question.create({
  //         data: {
  //           testId: testId,
  //           type: q.type,
  //           content: q.content,
  //           points: q.points,
  //           answers: {
  //             create: q.answers.map((a) => ({
  //               content: a.content,
  //               isCorrect: a.isCorrect,
  //             })),
  //           },
  //         },
  //         include: { answers: true },
  //       }),
  //     ),
  //   );

  //   return {
  //     message: `Успішно додано ${createdQuestions.length} питань до тесту`,
  //     questions: createdQuestions,
  //   };
  // }

  // async updateQuestion(
  //   teacherId: string,
  //   testId: string,
  //   questionId: string,
  //   dto: UpdateQuestionDto,
  // ) {
  //   const test = await this.prisma.test.findUnique({ where: { id: testId } });
  //   if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

  //   await this.verifyTeacherWriteAccess(test.courseId, teacherId);

  //   const question = await this.prisma.question.findUnique({
  //     where: { id: questionId },
  //     include: { answers: true },
  //   });

  //   if (!question || question.testId !== testId) {
  //     throw new HttpException('Питання не знайдено в цьому тесті', HttpStatus.NOT_FOUND);
  //   }

  //   const newType = dto.type || (question.type as QuestionType);
  //   if (newType === QuestionType.ONE_CHOICE && dto.answers) {
  //     if (dto.answers.length !== 4) {
  //       throw new HttpException(
  //         'Для питання з однією правильною відповіддю має бути рівно 4 варіанти',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //     const correctAnswersCount = dto.answers.filter((a) => a.isCorrect).length;
  //     if (correctAnswersCount !== 1) {
  //       throw new HttpException(
  //         'Для цього типу питання має бути рівно 1 правильна відповідь',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //   }

  //   const updateData: any = {};
  //   if (dto.type) updateData.type = dto.type;
  //   if (dto.content) updateData.content = dto.content;
  //   if (dto.points !== undefined) updateData.points = dto.points;

  //   if (dto.answers) {
  //     updateData.answers = {
  //       deleteMany: {},
  //       create: dto.answers.map((a) => ({
  //         content: a.content,
  //         isCorrect: a.isCorrect,
  //       })),
  //     };
  //   }

  //   return this.prisma.question.update({
  //     where: { id: questionId },
  //     data: updateData,
  //     include: { answers: true },
  //   });
  // }

  // async deleteQuestion(teacherId: string, testId: string, questionId: string) {
  //   const test = await this.prisma.test.findUnique({ where: { id: testId } });
  //   if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);
  //   await this.verifyTeacherWriteAccess(test.courseId, teacherId);

  //   await this.prisma.question.delete({ where: { id: questionId } });
  //   return { message: 'Питання видалено' };
  // }

  async submitTest(studentId: string, testId: string, dto: SubmitTestDto) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        course: { include: { students: true } },
        questions: { include: { answers: true } },
      },
    });

    if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

    const isStudent = test.course.students.some((s) => s.studentId === studentId);
    if (!isStudent) throw new HttpException('Ви не є учнем цього курсу', HttpStatus.FORBIDDEN);

    const attemptsCount = await this.prisma.submission.count({ where: { testId, studentId } });
    if (attemptsCount >= test.maxAttempts) {
      throw new HttpException('Ви використали всі доступні спроби', HttpStatus.BAD_REQUEST);
    }

    let totalScore = 0;
    const userAnswersByQuestion: Record<string, string[]> = {};
    for (const selection of dto.answers) {
      if (!userAnswersByQuestion[selection.questionId]) {
        userAnswersByQuestion[selection.questionId] = [];
      }
      userAnswersByQuestion[selection.questionId].push(selection.answerId);
    }

    for (const question of test.questions) {
      const selectedAnswerIds = userAnswersByQuestion[question.id] || [];
      if (selectedAnswerIds.length === 0) continue;

      if (question.type === 'ONE_CHOICE') {
        const answer = question.answers.find((a) => a.id === selectedAnswerIds[0]);
        if (answer && answer.isCorrect) {
          totalScore += question.points;
        }
      } else if (question.type === 'MULTIPLE_CHOICE') {
        const correctAnswers = question.answers.filter((a) => a.isCorrect);
        const incorrectAnswers = question.answers.filter((a) => !a.isCorrect);

        let studentCorrectHits = 0;
        let studentIncorrectHits = 0;

        for (const answerId of selectedAnswerIds) {
          if (correctAnswers.some((ca) => ca.id === answerId)) studentCorrectHits++;
          if (incorrectAnswers.some((ia) => ia.id === answerId)) studentIncorrectHits++;
        }

        const netHits = Math.max(0, studentCorrectHits - studentIncorrectHits);

        if (correctAnswers.length > 0) {
          const partialScore = (netHits / correctAnswers.length) * question.points;
          totalScore += partialScore;
        }
      }
    }

    const finalScoreStr = Number(totalScore.toFixed(2)).toString();

    return this.prisma.submission.create({
      data: {
        testId,
        studentId,
        score: finalScoreStr,
        duration: dto.duration,
        checkedAt: new Date(),
        attachments: [],
        testAnswers: {
          create: dto.answers.map((ans) => ({
            questionId: ans.questionId,
            answerId: ans.answerId,
          })),
        },
      },
    });
  }
}
