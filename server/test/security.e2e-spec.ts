process.env.JWT_ACCESS_SECRET = 'test_secret_for_e2e';

import { afterAll, beforeAll, describe, it, jest } from '@jest/globals';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { AwsS3Service } from './../src/core/integrations/aws/aws-s3.service';
import { PrismaService } from './../src/core/prisma/prisma.service';
import { NotificationsService } from './../src/modules/notifications/notifications.service';

describe('API Security & RBAC (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  let studentToken: string;
  let teacherToken: string;
  let parentToken: string;
  const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token.here';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        course: {
          findUnique: jest.fn<any>().mockResolvedValue({
            id: 'course-1',
            creatorId: 'teacher-id',
            coTeachers: [],
            students: [{ studentId: 'student-id' }],
            subject: { name: 'Математика' },
            class: { name: '10-А' },
          }),
        },
        task: {
          create: jest.fn<any>().mockResolvedValue({
            id: 'task-1',
            title: 'Тестове завдання',
            courseId: 'course-1',
          }),
          findMany: jest.fn<any>().mockResolvedValue([
            {
              id: 'task-1',
              title: 'Завдання 1',
              attachments: [],
              creator: { avatarUrl: 'img.jpg' },
            },
          ]),
          findUnique: jest.fn<any>().mockResolvedValue({
            id: 'task-1',
            courseId: 'course-1',
            attachments: [],
            creator: { avatarUrl: 'img.jpg' },
          }),
          update: jest.fn<any>().mockResolvedValue({ id: 'task-1', courseId: 'course-1' }),
          delete: jest.fn<any>().mockResolvedValue({ id: 'task-1' }),
        },
        courseModule: {
          findFirst: jest.fn<any>().mockResolvedValue(null),
          create: jest.fn<any>().mockResolvedValue({ id: 'module-1', title: 'Тема 1' }),
        },
        user: { findUnique: jest.fn<any>() },
      })
      .overrideProvider(NotificationsService)
      .useValue({
        getCourseParticipants: jest.fn<any>().mockResolvedValue([]),
        createMany: jest.fn<any>().mockResolvedValue({ count: 0 }),
      })
      .overrideProvider(AwsS3Service)
      .useValue({
        uploadFile: jest.fn<any>().mockResolvedValue('http://fake-s3-url.com/file.pdf'),
        deleteFile: jest.fn<any>().mockResolvedValue(true),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);

    studentToken = jwtService.sign(
      { id: 'student-id', email: 'student@test.com', roles: ['STUDENT'] },
      { secret: 'test_secret_for_e2e' },
    );

    teacherToken = jwtService.sign(
      { id: 'teacher-id', email: 'teacher@test.com', roles: ['TEACHER'] },
      { secret: 'test_secret_for_e2e' },
    );

    parentToken = jwtService.sign(
      { id: 'parent-id', email: 'parent@test.com', roles: ['PARENT'] },
      { secret: 'test_secret_for_e2e' },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. /api/tasks (POST) - Unauthorized (401) якщо немає токена', () => {
    return request(app.getHttpServer())
      .post('/api/tasks')
      .send({ title: 'Тест' })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('2. /api/tasks (POST) - Unauthorized (401) якщо токен невалідний/пошкоджений', () => {
    return request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${invalidToken}`)
      .send({ title: 'Тест' })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('3. /api/tasks (POST) - Forbidden (403) якщо користувач має роль STUDENT', () => {
    return request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Тест' })
      .expect(HttpStatus.FORBIDDEN);
  });

  it('4. /api/tasks (POST) - Forbidden (403) якщо користувач має роль PARENT', () => {
    return request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({ title: 'Тест' })
      .expect(HttpStatus.FORBIDDEN);
  });

  it('5. /api/tasks (POST) - Created (201) якщо користувач має роль TEACHER', () => {
    return request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ title: 'Законне завдання', courseId: 'course-1', newModuleTitle: 'Тема 1' })
      .expect(HttpStatus.CREATED);
  });

  it('6. /api/tasks/course/:id (GET) - Unauthorized (401) якщо немає токена', () => {
    return request(app.getHttpServer())
      .get('/api/tasks/course/course-1')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('7. /api/tasks/course/:id (GET) - OK (200) дозволено учням цього курсу', () => {
    return request(app.getHttpServer())
      .get('/api/tasks/course/course-1')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(HttpStatus.OK);
  });

  it('8. /api/tasks/:id (DELETE) - Forbidden (403) заборонено для учнів', () => {
    return request(app.getHttpServer())
      .delete('/api/tasks/task-1')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('9. /api/tasks/:id (DELETE) - OK (200) дозволено для вчителів', () => {
    return request(app.getHttpServer())
      .delete('/api/tasks/task-1')
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(HttpStatus.OK);
  });

  it('10. /api/tasks/:id (PATCH) - Forbidden (403) заборонено для батьків', () => {
    return request(app.getHttpServer())
      .patch('/api/tasks/task-1')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({ title: 'Змінена назва' })
      .expect(HttpStatus.FORBIDDEN);
  });
});
