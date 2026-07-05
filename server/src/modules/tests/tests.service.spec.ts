import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AwsS3Service } from '../../core/integrations/aws/aws-s3.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TestsService } from './tests.service';

describe('TestsService', () => {
  let testsService: TestsService;
  let prismaService: any;

  const mockPrismaService = {
    test: { findUnique: jest.fn(), findMany: jest.fn() },
    submission: { count: jest.fn(), create: jest.fn() },
    user: { findUnique: jest.fn() },
    course: { findUnique: jest.fn() },
  };

  const mockAwsS3Service = {
    generatePresignedUrl: jest
      .fn()
      .mockImplementation((url) => Promise.resolve(`${url}?signed=true`)),
  };

  const mockNotificationsService = { create: jest.fn(), createMany: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AwsS3Service, useValue: mockAwsS3Service },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    testsService = module.get<TestsService>(TestsService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('submitTest()', () => {
    it('1. повинен викинути помилку, якщо тест не знайдено', async () => {
      prismaService.test.findUnique.mockResolvedValue(null);
      await expect(
        testsService.submitTest('student-id', 'invalid-test-id', { answers: [], duration: 10 }),
      ).rejects.toThrow(new HttpException('Тест не знайдено', HttpStatus.NOT_FOUND));
    });

    it('2. повинен викинути помилку, якщо учень не належить до курсу', async () => {
      prismaService.test.findUnique.mockResolvedValue({
        id: 'test-1',
        course: { students: [{ studentId: 'another-student' }] },
      });
      await expect(
        testsService.submitTest('student-id', 'test-1', { answers: [], duration: 10 }),
      ).rejects.toThrow(new HttpException('Ви не є учнем цього курсу', HttpStatus.FORBIDDEN));
    });

    it('3. повинен викинути помилку, якщо вичерпано ліміт спроб', async () => {
      prismaService.test.findUnique.mockResolvedValue({
        id: 'test-1',
        maxAttempts: 2,
        course: { students: [{ studentId: 'student-id' }] },
      });
      prismaService.submission.count.mockResolvedValue(2);

      await expect(
        testsService.submitTest('student-id', 'test-1', { answers: [], duration: 10 }),
      ).rejects.toThrow(
        new HttpException('Ви використали всі доступні спроби', HttpStatus.BAD_REQUEST),
      );
    });

    it('4. повинен нарахувати максимум балів за ідеальне проходження ONE_CHOICE та MULTIPLE_CHOICE', async () => {
      const mockTest = {
        id: 'test-1',
        maxAttempts: 3,
        course: { students: [{ studentId: 'student-1' }] },
        questions: [
          {
            id: 'q1',
            type: 'ONE_CHOICE',
            points: 5,
            answers: [
              { id: 'a1', isCorrect: true },
              { id: 'a2', isCorrect: false },
            ],
          },
          {
            id: 'q2',
            type: 'MULTIPLE_CHOICE',
            points: 10,
            answers: [
              { id: 'a3', isCorrect: true },
              { id: 'a4', isCorrect: true },
              { id: 'a5', isCorrect: false },
            ],
          },
        ],
      };
      prismaService.test.findUnique.mockResolvedValue(mockTest);
      prismaService.submission.count.mockResolvedValue(0);
      prismaService.submission.create.mockImplementation((args) =>
        Promise.resolve({ id: 'sub-1', ...args.data }),
      );

      const dto = {
        duration: 15,
        answers: [
          { questionId: 'q1', answerId: 'a1' },
          { questionId: 'q2', answerId: 'a3' },
          { questionId: 'q2', answerId: 'a4' },
        ],
      };
      const result = await testsService.submitTest('student-1', 'test-1', dto);
      expect(result.score).toBe('15');
    });

    it('5. повинен віднімати бали за неправильні відповіді у MULTIPLE_CHOICE', async () => {
      const mockTest = {
        id: 'test-1',
        maxAttempts: 3,
        course: { students: [{ studentId: 'student-1' }] },
        questions: [
          {
            id: 'q2',
            type: 'MULTIPLE_CHOICE',
            points: 10,
            answers: [
              { id: 'a3', isCorrect: true },
              { id: 'a4', isCorrect: true },
              { id: 'a5', isCorrect: false },
            ],
          },
        ],
      };
      prismaService.test.findUnique.mockResolvedValue(mockTest);
      prismaService.submission.count.mockResolvedValue(0);
      prismaService.submission.create.mockImplementation((args) =>
        Promise.resolve({ id: 'sub-1', ...args.data }),
      );

      const dto = {
        duration: 15,
        answers: [
          { questionId: 'q2', answerId: 'a3' },
          { questionId: 'q2', answerId: 'a5' },
        ],
      };
      const result = await testsService.submitTest('student-1', 'test-1', dto);
      expect(result.score).toBe('0');
    });

    it('6. не повинен робити бал відємним, якщо всі відповіді MULTIPLE_CHOICE хибні', async () => {
      const mockTest = {
        id: 'test-1',
        maxAttempts: 3,
        course: { students: [{ studentId: 'student-1' }] },
        questions: [
          {
            id: 'q1',
            type: 'MULTIPLE_CHOICE',
            points: 10,
            answers: [
              { id: 'a1', isCorrect: true },
              { id: 'a2', isCorrect: false },
              { id: 'a3', isCorrect: false },
            ],
          },
        ],
      };
      prismaService.test.findUnique.mockResolvedValue(mockTest);
      prismaService.submission.count.mockResolvedValue(0);
      prismaService.submission.create.mockImplementation((args) =>
        Promise.resolve({ id: 'sub-1', ...args.data }),
      );

      const dto = {
        duration: 15,
        answers: [
          { questionId: 'q1', answerId: 'a2' },
          { questionId: 'q1', answerId: 'a3' },
        ],
      };
      const result = await testsService.submitTest('student-1', 'test-1', dto);
      expect(result.score).toBe('0');
    });

    it('7. повинен ігнорувати питання, на які учень не дав жодної відповіді', async () => {
      const mockTest = {
        id: 'test-1',
        maxAttempts: 3,
        course: { students: [{ studentId: 'student-1' }] },
        questions: [
          { id: 'q1', type: 'ONE_CHOICE', points: 5, answers: [{ id: 'a1', isCorrect: true }] },
          { id: 'q2', type: 'ONE_CHOICE', points: 5, answers: [{ id: 'a2', isCorrect: true }] },
        ],
      };
      prismaService.test.findUnique.mockResolvedValue(mockTest);
      prismaService.submission.count.mockResolvedValue(0);
      prismaService.submission.create.mockImplementation((args) =>
        Promise.resolve({ id: 'sub-1', ...args.data }),
      );

      const dto = { duration: 15, answers: [{ questionId: 'q1', answerId: 'a1' }] };
      const result = await testsService.submitTest('student-1', 'test-1', dto);
      expect(result.score).toBe('5');
    });

    it('8. повинен зараховувати часткові бали за неповну відповідь у MULTIPLE_CHOICE', async () => {
      const mockTest = {
        id: 'test-1',
        maxAttempts: 3,
        course: { students: [{ studentId: 'student-1' }] },
        questions: [
          {
            id: 'q1',
            type: 'MULTIPLE_CHOICE',
            points: 10,
            answers: [
              { id: 'a1', isCorrect: true },
              { id: 'a2', isCorrect: true },
              { id: 'a3', isCorrect: true },
            ],
          },
        ],
      };
      prismaService.test.findUnique.mockResolvedValue(mockTest);
      prismaService.submission.count.mockResolvedValue(0);
      prismaService.submission.create.mockImplementation((args) =>
        Promise.resolve({ id: 'sub-1', ...args.data }),
      );

      const dto = {
        duration: 15,
        answers: [
          { questionId: 'q1', answerId: 'a1' },
          { questionId: 'q1', answerId: 'a2' },
        ],
      };
      const result = await testsService.submitTest('student-1', 'test-1', dto);
      expect(result.score).toBe('6.67');
    });
  });

  describe('verifyTeacherWriteAccess()', () => {
    it('9. повинен дозволити доступ творцю курсу', async () => {
      prismaService.course.findUnique.mockResolvedValue({
        id: 'course-1',
        creatorId: 'teacher-1',
        coTeachers: [],
      });
      const result = await (testsService as any).verifyTeacherWriteAccess('course-1', 'teacher-1');
      expect(result).toBeDefined();
    });

    it('10. повинен дозволити доступ співвикладачу (coTeacher)', async () => {
      prismaService.course.findUnique.mockResolvedValue({
        id: 'course-1',
        creatorId: 'teacher-1',
        coTeachers: [{ teacherId: 'teacher-2' }],
      });
      const result = await (testsService as any).verifyTeacherWriteAccess('course-1', 'teacher-2');
      expect(result).toBeDefined();
    });

    it('11. повинен заборонити доступ викладачу, який не відноситься до курсу', async () => {
      prismaService.course.findUnique.mockResolvedValue({
        id: 'course-1',
        creatorId: 'teacher-1',
        coTeachers: [],
      });
      await expect(
        (testsService as any).verifyTeacherWriteAccess('course-1', 'teacher-stranger'),
      ).rejects.toThrow(
        new HttpException(
          'У вас немає прав для роботи з тестами у цьому курсі',
          HttpStatus.FORBIDDEN,
        ),
      );
    });
  });

  describe('findAllByCourse()', () => {
    it('12. повинен повертати тільки не приховані тести для звичайних користувачів', async () => {
      prismaService.course.findUnique.mockResolvedValue({
        id: 'course-1',
        creatorId: 'teacher-1',
        coTeachers: [],
        students: [{ studentId: 'student-1' }],
        class: { homeroomTeacherId: 'teacher-3' },
      });
      prismaService.test.findMany.mockResolvedValue([
        { id: 'test-1', isHidden: false, creator: { avatarUrl: 'default.jpg' } },
      ]);

      const result = await testsService.findAllByCourse('student-1', 'course-1');
      expect(prismaService.test.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isHidden: false }),
        }),
      );
    });
  });

  describe('getTestDetails()', () => {
    it('13. повинен приховувати поле "isCorrect" з відповідей для учнів', async () => {
      const mockTest = {
        id: 'test-secret',
        isHidden: false,
        creator: { avatarUrl: 'photo.jpg' },
        course: {
          creatorId: 'teacher-1',
          coTeachers: [],
          students: [{ studentId: 'student-1' }],
          class: { homeroomTeacherId: 'teacher-3' },
        },
        questions: [
          {
            id: 'q1',
            content: 'Секретне питання',
            answers: [
              { id: 'a1', content: 'Відповідь А', isCorrect: true },
              { id: 'a2', content: 'Відповідь Б', isCorrect: false },
            ],
          },
        ],
      };
      prismaService.test.findUnique.mockResolvedValue(mockTest);

      const result = await testsService.getTestDetails('student-1', 'test-secret');

      expect(result.questions[0].answers[0]).not.toHaveProperty('isCorrect');
      expect(result.questions[0].answers[1]).not.toHaveProperty('isCorrect');
      expect(result.questions[0].answers[0].content).toBe('Відповідь А');
    });

    it('14. повинен залишати поле "isCorrect" видимим для вчителя курсу', async () => {
      const mockTest = {
        id: 'test-secret',
        isHidden: false,
        creator: { avatarUrl: 'photo.jpg' },
        course: {
          creatorId: 'teacher-1',
          coTeachers: [],
          students: [],
          class: { homeroomTeacherId: 'teacher-3' },
        },
        questions: [
          {
            id: 'q1',
            content: 'Секретне питання',
            answers: [{ id: 'a1', content: 'Відповідь А', isCorrect: true }],
          },
        ],
      };
      prismaService.test.findUnique.mockResolvedValue(mockTest);

      const result = await testsService.getTestDetails('teacher-1', 'test-secret');

      expect(result.questions[0].answers[0]).toHaveProperty('isCorrect');
      expect((result.questions[0].answers[0] as any).isCorrect).toBe(true);
    });

    it('15. повинен блокувати доступ до прихованого тесту для учня', async () => {
      const mockTest = {
        id: 'test-hidden',
        isHidden: true,
        creator: { avatarUrl: 'photo.jpg' },
        course: {
          creatorId: 'teacher-1',
          coTeachers: [],
          students: [{ studentId: 'student-1' }],
          class: { homeroomTeacherId: 'teacher-3' },
        },
      };
      prismaService.test.findUnique.mockResolvedValue(mockTest);

      await expect(testsService.getTestDetails('student-1', 'test-hidden')).rejects.toThrow(
        new HttpException(
          'Доступ до цього тесту заборонено (він прихований)',
          HttpStatus.FORBIDDEN,
        ),
      );
    });

    it('16. повинен відхиляти відправку тесту, якщо дедлайн вже минув', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const mockTest = {
        id: 'test-expired',
        maxAttempts: 3,
        deadline: pastDate,
        course: { students: [{ studentId: 'student-1' }] },
        questions: [],
      };

      prismaService.test.findUnique.mockResolvedValue(mockTest);
      prismaService.submission.count.mockResolvedValue(0);

      await expect(
        testsService.submitTest('student-1', 'test-expired', { duration: 15, answers: [] }),
      ).rejects.toThrow(
        new HttpException(
          'Час на виконання тесту вичерпано (дедлайн минув)',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });
});
