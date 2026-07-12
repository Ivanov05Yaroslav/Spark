import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AwsS3Service } from '../../core/integrations/aws/aws-s3.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AttendanceMarkDto, SaveLessonJournalDto } from './dto/journal.dto';

const GENERAL_GROUP_KEY = 'GENERAL';

type NusColumn = {
  key: string;
  id: string | null;
  name: string;
};

type AverageCell = {
  average: number;
  grade: number;
  count: number;
};

@Injectable()
export class JournalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  private async getTeacherCourse(courseId: string, teacherId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        coTeachers: true,
        subject: true,
        students: {
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
          orderBy: { student: { lastName: 'asc' } },
        },
      },
    });

    if (!course) throw new HttpException('Курс не знайдено', HttpStatus.NOT_FOUND);

    const isTeacher =
      course.creatorId === teacherId ||
      course.coTeachers.some((item) => item.teacherId === teacherId);

    if (!isTeacher) throw new HttpException('Немає прав доступу до журналу', HttpStatus.FORBIDDEN);
    return course;
  }

  private toColumn(group: { id: string; name: string }): NusColumn {
    return { key: group.id, id: group.id, name: group.name };
  }

  private generalColumn(): NusColumn {
    return { key: GENERAL_GROUP_KEY, id: null, name: 'Заг. оц.' };
  }

  private uniqueColumns(groups: Array<{ id: string; name: string }>, includeGeneral = false) {
    const unique = new Map<string, NusColumn>();
    for (const group of groups) unique.set(group.id, this.toColumn(group));
    if (includeGeneral) unique.set(GENERAL_GROUP_KEY, this.generalColumn());
    return [...unique.values()];
  }

  private gradeKey(nusGroupId: string | null) {
    return nusGroupId ?? GENERAL_GROUP_KEY;
  }

  private average(values: Array<number | null | undefined>): AverageCell | null {
    const actual = values.filter((value): value is number => typeof value === 'number');
    if (actual.length === 0) return null;
    const raw = actual.reduce((sum, value) => sum + value, 0) / actual.length;
    return {
      average: Math.round(raw * 100) / 100,
      grade: Math.round(raw),
      count: actual.length,
    };
  }

  async getLessons(teacherId: string, courseId: string) {
    await this.getTeacherCourse(courseId, teacherId);
    return this.prisma.lesson.findMany({
      where: { courseId },
      select: {
        id: true,
        title: true,
        date: true,
        courseModule: { select: { id: true, title: true, semester: true } },
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async getLessonJournal(teacherId: string, courseId: string, lessonId: string) {
    const course = await this.getTeacherCourse(courseId, teacherId);

    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, courseId },
      include: {
        courseModule: { select: { id: true, title: true, semester: true } },
        nusGroups: { orderBy: { name: 'asc' } },
        task: { include: { nusGroups: { orderBy: { name: 'asc' } } } },
        test: {
          include: {
            questions: {
              select: {
                nusGroupId: true,
                nusGroup: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!lesson) throw new HttpException('Урок не знайдено', HttpStatus.NOT_FOUND);

    const [attendanceRows, gradeRows, lessonNavigation] = await Promise.all([
      this.prisma.attendance.findMany({ where: { courseId, lessonId } }),

      this.prisma.gradebook.findMany({
        where: { courseId, lessonId },
        orderBy: [{ date: 'asc' }, { id: 'asc' }],
      }),
      this.prisma.lesson.findMany({
        where: { courseId },
        select: { id: true, date: true },
        orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      }),
    ]);

    const lessonColumns = this.uniqueColumns(lesson.nusGroups, lesson.nusGroups.length === 0);

    const taskColumns = lesson.task
      ? this.uniqueColumns(lesson.task.nusGroups, lesson.task.nusGroups.length === 0)
      : [];

    const testGroups =
      lesson.test?.questions
        .map((question) => question.nusGroup)
        .filter((group): group is { id: string; name: string } => Boolean(group)) ?? [];
    const testHasGeneral = lesson.test?.questions.some((question) => !question.nusGroupId) ?? false;
    const testColumns = lesson.test
      ? this.uniqueColumns(testGroups, testHasGeneral || testGroups.length === 0)
      : [];

    const attendanceByStudent = new Map(
      attendanceRows.map((row) => [row.studentId, row.status === 'ABSENT' ? 'N' : 'HV']),
    );

    const lessonGrades = new Map<string, Map<string, number>>();
    const taskGrades = new Map<string, Map<string, number>>();
    const testGrades = new Map<string, Map<string, number>>();

    for (const grade of gradeRows) {
      if (grade.score === null) continue;

      const target = grade.taskId ? taskGrades : grade.testId ? testGrades : lessonGrades;
      const studentMap = target.get(grade.studentId) ?? new Map<string, number>();
      studentMap.set(this.gradeKey(grade.nusGroupId), grade.score);
      target.set(grade.studentId, studentMap);
    }

    const navigationIndex = lessonNavigation.findIndex((item) => item.id === lesson.id);
    const previousLesson = navigationIndex > 0 ? lessonNavigation[navigationIndex - 1] : null;
    const nextLesson =
      navigationIndex >= 0 && navigationIndex < lessonNavigation.length - 1
        ? lessonNavigation[navigationIndex + 1]
        : null;

    const formattedStudents = await Promise.all(
      course.students.map(async ({ student }) => ({
        id: student.id,
        firstName: student.firstName,
        middleName: student.middleName,
        lastName: student.lastName,
        avatarUrl: student.avatarUrl
          ? await this.awsS3Service.generatePresignedUrl(student.avatarUrl)
          : null,
        attendance: attendanceByStudent.get(student.id) ?? null,
        lessonGrades: Object.fromEntries(lessonGrades.get(student.id) ?? []),
        taskGrades: Object.fromEntries(taskGrades.get(student.id) ?? []),
        testGrades: Object.fromEntries(testGrades.get(student.id) ?? []),
      })),
    );

    return {
      lesson: {
        id: lesson.id,
        title: lesson.title,
        date: lesson.date,
        module: lesson.courseModule,
      },
      navigation: {
        previousLessonId: previousLesson?.id ?? null,
        nextLessonId: nextLesson?.id ?? null,
      },
      columns: {
        attendance: {
          editable: true,
          marks: [
            { value: 'N', label: 'Відсутній' },
            { value: 'HV', label: 'Хворіє' },
          ],
        },
        lesson: {
          id: lesson.id,
          title: 'Оцінка за урок',
          editable: true,
          groups: lessonColumns,
        },
        task: lesson.task
          ? { id: lesson.task.id, title: lesson.task.title, editable: false, groups: taskColumns }
          : null,
        test: lesson.test
          ? { id: lesson.test.id, title: lesson.test.title, editable: false, groups: testColumns }
          : null,
      },
      students: formattedStudents,
    };
  }

  async saveLessonJournal(
    teacherId: string,
    courseId: string,
    lessonId: string,
    dto: SaveLessonJournalDto,
  ) {
    const course = await this.getTeacherCourse(courseId, teacherId);
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, courseId },
      include: { nusGroups: { select: { id: true } } },
    });
    if (!lesson) throw new HttpException('Урок не знайдено', HttpStatus.NOT_FOUND);

    const enrolledStudentIds = new Set(course.students.map((item) => item.studentId));
    const lessonGroupIds = new Set(lesson.nusGroups.map((group) => group.id));
    const lessonUsesGeneralGrade = lessonGroupIds.size === 0;

    await this.prisma.$transaction(async (tx) => {
      for (const change of dto.changes) {
        if (!enrolledStudentIds.has(change.studentId)) continue;

        if (change.attendance !== undefined) {
          await tx.attendance.deleteMany({
            where: { lessonId, studentId: change.studentId },
          });
          if (change.attendance !== null) {
            await tx.attendance.create({
              data: {
                lessonId,
                courseId,
                studentId: change.studentId,
                date: lesson.date,
                status: change.attendance === AttendanceMarkDto.ABSENT ? 'ABSENT' : 'SICK',
              },
            });
          }
        }

        for (const grade of change.lessonGrades ?? []) {
          const nusGroupId = grade.nusGroupId ?? null;
          await tx.gradebook.deleteMany({
            where: {
              studentId: change.studentId,
              courseId,
              lessonId,
              taskId: null,
              testId: null,
              nusGroupId,
            },
          });

          if (grade.score !== null) {
            await tx.gradebook.create({
              data: {
                studentId: change.studentId,
                teacherId,
                courseId,
                lessonId,
                taskId: null,
                testId: null,
                nusGroupId,
                gradeType: nusGroupId ? 'NUS' : 'TRADITIONAL',
                score: grade.score,
                date: lesson.date,
              },
            });
          }
        }
      }
    });
    return this.getLessonJournal(teacherId, courseId, lessonId);
  }

  async getSummary(teacherId: string, courseId: string, semester = 1) {
    const course = await this.getTeacherCourse(courseId, teacherId);

    const [modules, allSubjectGroups, rawGrades] = await Promise.all([
      this.prisma.courseModule.findMany({
        where: { courseId, semester },
        select: {
          id: true,
          title: true,
          semester: true,
          createdAt: true,
          lessons: { select: { id: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.nusGroup.findMany({
        where: { subjectId: course.subjectId },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.gradebook.findMany({
        where: {
          courseId,
          lesson: { is: { courseModule: { semester } } },
          score: { not: null },
        },
        select: {
          id: true,
          studentId: true,
          lessonId: true,
          taskId: true,
          testId: true,
          nusGroupId: true,
          score: true,
          date: true,
          lesson: { select: { courseModuleId: true } },
        },
        orderBy: [{ date: 'asc' }, { id: 'asc' }],
      }),
    ]);

    const latestCell = new Map<string, (typeof rawGrades)[number]>();
    for (const grade of rawGrades) {
      const source = grade.taskId
        ? `TASK:${grade.taskId}`
        : grade.testId
          ? `TEST:${grade.testId}`
          : `LESSON:${grade.lessonId}`;
      const key = `${grade.studentId}|${source}|${grade.nusGroupId ?? GENERAL_GROUP_KEY}`;
      latestCell.set(key, grade);
    }

    const deduplicated = [...latestCell.values()];

    const sourcesWithNus = new Set<string>();
    for (const grade of deduplicated) {
      if (!grade.nusGroupId) continue;
      const source = grade.taskId
        ? `TASK:${grade.taskId}`
        : grade.testId
          ? `TEST:${grade.testId}`
          : `LESSON:${grade.lessonId}`;
      sourcesWithNus.add(`${grade.studentId}|${source}`);
    }

    const effectiveGrades = deduplicated.filter((grade) => {
      if (grade.nusGroupId) return true;
      const source = grade.taskId
        ? `TASK:${grade.taskId}`
        : grade.testId
          ? `TEST:${grade.testId}`
          : `LESSON:${grade.lessonId}`;
      return !sourcesWithNus.has(`${grade.studentId}|${source}`);
    });

    const usedGroupIds = new Set(
      effectiveGrades.map((grade) => grade.nusGroupId).filter((id): id is string => Boolean(id)),
    );

    const groups = allSubjectGroups.filter((group) => usedGroupIds.has(group.id));

    const moduleByLessonId = new Map<string, string>();
    for (const module of modules) {
      for (const lesson of module.lessons) moduleByLessonId.set(lesson.id, module.id);
    }

    const formattedStudents = await Promise.all(
      course.students.map(async ({ student }) => {
        const studentGrades = effectiveGrades.filter(
          (grade) => grade.studentId === student.id && grade.score !== null,
        );

        const moduleResults = modules.map((module, index) => {
          const grades = studentGrades.filter(
            (grade) => grade.lessonId && moduleByLessonId.get(grade.lessonId) === module.id,
          );

          const groupResults = Object.fromEntries(
            groups.map((group) => [
              group.id,
              this.average(
                grades.filter((grade) => grade.nusGroupId === group.id).map((grade) => grade.score),
              ),
            ]),
          );

          const thematicOverall = this.average(
            Object.values(groupResults).map((cell) => cell?.average),
          );
          const current = this.average(grades.map((grade) => grade.score));

          return {
            moduleId: module.id,
            moduleTitle: module.title,
            number: index + 1,
            current,
            groups: groupResults,
            overall: thematicOverall ?? current,
          };
        });

        const overallGroups = Object.fromEntries(
          groups.map((group) => [
            group.id,
            this.average(
              studentGrades
                .filter((grade) => grade.nusGroupId === group.id)
                .map((grade) => grade.score),
            ),
          ]),
        );

        const semesterGrade = this.average(
          Object.values(overallGroups).map((cell) => cell?.average),
        );

        return {
          id: student.id,
          firstName: student.firstName,
          middleName: student.middleName,
          lastName: student.lastName,
          avatarUrl: student.avatarUrl
            ? await this.awsS3Service.generatePresignedUrl(student.avatarUrl)
            : null,
          modules: moduleResults,
          overallGroups,
          semesterGrade:
            semesterGrade ??
            this.average(moduleResults.map((moduleResult) => moduleResult.overall?.average)),
        };
      }),
    );

    return {
      semester,
      groups,
      modules: modules.map((module, index) => ({
        id: module.id,
        title: module.title,
        number: index + 1,
        currentLabel: `ПО Т${index + 1}`,
        thematicLabel: `ТО Т${index + 1}`,
        overallLabel: `ТО Т${index + 1} заг.`,
      })),
      students: formattedStudents,
    };
  }
}
