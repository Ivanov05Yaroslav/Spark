import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  BulkCreateQuestionDto,
  CreateQuestionDto,
  CreateTestDto,
  QuestionType,
  SubmitTestDto,
  UpdateQuestionDto,
  UpdateTestDto,
} from './dto/test.dto';

@Injectable()
export class TestsService {
  constructor(private readonly prisma: PrismaService) {}

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
        'У вас немає прав для роботи з тестами у цьому курсі',
        HttpStatus.FORBIDDEN,
      );
    }
    return course;
  }

  async createTest(teacherId: string, dto: CreateTestDto) {
    await this.verifyTeacherWriteAccess(dto.courseId, teacherId);

    return this.prisma.test.create({
      data: {
        courseId: dto.courseId,
        creatorId: teacherId,
        nusGroupId: dto.nusGroupId,
        courseModuleId: dto.courseModuleId || null,
        title: dto.title,
        timeLimitMinutes: dto.timeLimitMinutes,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        maxAttempts: dto.maxAttempts || 1,
        isResultHidden: dto.isResultHidden || false,
        isHidden: dto.isHidden || false,
      },
    });
  }

  async updateTest(teacherId: string, testId: string, dto: UpdateTestDto) {
    const test = await this.prisma.test.findUnique({ where: { id: testId } });
    if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

    await this.verifyTeacherWriteAccess(test.courseId, teacherId);

    return this.prisma.test.update({
      where: { id: testId },
      data: {
        nusGroupId: dto.nusGroupId,
        courseModuleId: dto.courseModuleId !== undefined ? dto.courseModuleId : undefined,
        title: dto.title,
        timeLimitMinutes: dto.timeLimitMinutes,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        maxAttempts: dto.maxAttempts,
        isResultHidden: dto.isResultHidden,
        isHidden: dto.isHidden,
      },
    });
  }

  async deleteTest(teacherId: string, testId: string) {
    const test = await this.prisma.test.findUnique({ where: { id: testId } });
    if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

    await this.verifyTeacherWriteAccess(test.courseId, teacherId);

    await this.prisma.test.delete({ where: { id: testId } });
    return { message: 'Тест успішно видалено' };
  }

  async addQuestion(teacherId: string, testId: string, dto: CreateQuestionDto) {
    const test = await this.prisma.test.findUnique({ where: { id: testId } });
    if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

    await this.verifyTeacherWriteAccess(test.courseId, teacherId);

    if (dto.type === QuestionType.ONE_CHOICE) {
      if (dto.answers.length !== 4) {
        throw new HttpException(
          'Для питання з однією правильною відповіддю має бути рівно 4 варіанти',
          HttpStatus.BAD_REQUEST,
        );
      }
      const correctAnswersCount = dto.answers.filter((a) => a.isCorrect).length;
      if (correctAnswersCount !== 1) {
        throw new HttpException(
          'Для цього типу питання має бути рівно 1 правильна відповідь',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return this.prisma.question.create({
      data: {
        testId: testId,
        type: dto.type,
        content: dto.content,
        points: dto.points,
        answers: {
          create: dto.answers.map((a) => ({
            content: a.content,
            isCorrect: a.isCorrect,
          })),
        },
      },
      include: { answers: true },
    });
  }

  async addQuestionsBulk(teacherId: string, testId: string, dto: BulkCreateQuestionDto) {
    const test = await this.prisma.test.findUnique({ where: { id: testId } });
    if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

    await this.verifyTeacherWriteAccess(test.courseId, teacherId);

    for (const [index, q] of dto.questions.entries()) {
      if (q.type === QuestionType.ONE_CHOICE) {
        if (q.answers.length !== 4) {
          throw new HttpException(
            `Питання №${index + 1} ("${q.content}") має містити рівно 4 варіанти відповіді`,
            HttpStatus.BAD_REQUEST,
          );
        }
        const correctAnswersCount = q.answers.filter((a) => a.isCorrect).length;
        if (correctAnswersCount !== 1) {
          throw new HttpException(
            `Питання №${index + 1} ("${q.content}") має містити рівно 1 правильну відповідь`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    const createdQuestions = await this.prisma.$transaction(
      dto.questions.map((q) =>
        this.prisma.question.create({
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
          include: { answers: true },
        }),
      ),
    );

    return {
      message: `Успішно додано ${createdQuestions.length} питань до тесту`,
      questions: createdQuestions,
    };
  }

  async updateQuestion(
    teacherId: string,
    testId: string,
    questionId: string,
    dto: UpdateQuestionDto,
  ) {
    const test = await this.prisma.test.findUnique({ where: { id: testId } });
    if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

    await this.verifyTeacherWriteAccess(test.courseId, teacherId);

    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { answers: true },
    });

    if (!question || question.testId !== testId) {
      throw new HttpException('Питання не знайдено в цьому тесті', HttpStatus.NOT_FOUND);
    }

    const newType = dto.type || (question.type as QuestionType);
    if (newType === QuestionType.ONE_CHOICE && dto.answers) {
      if (dto.answers.length !== 4) {
        throw new HttpException(
          'Для питання з однією правильною відповіддю має бути рівно 4 варіанти',
          HttpStatus.BAD_REQUEST,
        );
      }
      const correctAnswersCount = dto.answers.filter((a) => a.isCorrect).length;
      if (correctAnswersCount !== 1) {
        throw new HttpException(
          'Для цього типу питання має бути рівно 1 правильна відповідь',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const updateData: any = {};
    if (dto.type) updateData.type = dto.type;
    if (dto.content) updateData.content = dto.content;
    if (dto.points !== undefined) updateData.points = dto.points;

    if (dto.answers) {
      updateData.answers = {
        deleteMany: {},
        create: dto.answers.map((a) => ({
          content: a.content,
          isCorrect: a.isCorrect,
        })),
      };
    }

    return this.prisma.question.update({
      where: { id: questionId },
      data: updateData,
      include: { answers: true },
    });
  }

  async deleteQuestion(teacherId: string, testId: string, questionId: string) {
    const test = await this.prisma.test.findUnique({ where: { id: testId } });
    if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);
    await this.verifyTeacherWriteAccess(test.courseId, teacherId);

    await this.prisma.question.delete({ where: { id: questionId } });
    return { message: 'Питання видалено' };
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

    return this.prisma.test.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { questions: true } },
        courseModule: { select: { id: true, title: true } },
      },
    });
  }

  async getTestDetails(userId: string, testId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        course: { include: { students: true, coTeachers: true, class: true } },
        questions: {
          include: { answers: true },
          orderBy: { id: 'asc' },
        },
      },
    });
    if (!test) throw new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND);

    const isTeacher =
      test.course.creatorId === userId ||
      test.course.coTeachers.some((ct) => ct.teacherId === userId);

    if (!isTeacher) {
      const isStudent = test.course.students.some((s) => s.studentId === userId);
      if (!isStudent || test.isHidden) {
        throw new HttpException('У вас немає доступу до цього тесту', HttpStatus.FORBIDDEN);
      }

      const safeQuestions = test.questions.map((question) => ({
        ...question,
        answers: question.answers.map((answer) => {
          const { isCorrect, ...safeAnswer } = answer;
          return safeAnswer;
        }),
      }));

      const { course: _, ...result } = test;
      return { ...result, questions: safeQuestions };
    }

    const { course: _, ...result } = test;
    return result;
  }

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
    for (const selection of dto.answers) {
      const question = test.questions.find((q) => q.id === selection.questionId);
      if (!question) continue;

      const answer = question.answers.find((a) => a.id === selection.answerId);
      if (answer && answer.isCorrect) {
        totalScore += question.points;
      }
    }

    return this.prisma.submission.create({
      data: {
        testId,
        studentId,
        score: totalScore.toString(),
        duration: dto.duration,
        checkedAt: new Date(),
        attachments: [],
      },
    });
  }
}
