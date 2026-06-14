import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import 'multer';
import { AwsS3Service } from '../../core/integrations/aws/aws-s3.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateCourseDto, GetCoursesQueryDto, UpdateCourseDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  private async ensureCourseCreator(courseId: string, teacherId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new HttpException('Курс не знайдено', HttpStatus.NOT_FOUND);
    if (course.creatorId !== teacherId) {
      throw new HttpException(
        'Тільки творець курсу (головний викладач) може виконувати цю дію',
        HttpStatus.FORBIDDEN,
      );
    }
    return course;
  }

  async getMySubjects(teacherId: string) {
    const teacherSubjects = await this.prisma.teacherSubject.findMany({
      where: { teacherId },
      include: { subject: true },
    });
    return teacherSubjects.map((ts) => ts.subject);
  }

  async getSchoolClasses(schoolId: string) {
    return this.prisma.class.findMany({
      where: { schoolId },
      orderBy: { name: 'asc' },
    });
  }

  async getCoTeachersForSubject(schoolId: string, subjectId: string, currentTeacherId: string) {
    return this.prisma.user.findMany({
      where: {
        schoolId,
        id: { not: currentTeacherId },
        userRoles: { some: { role: { name: 'TEACHER' } } },
        teacherSubjects: { some: { subjectId } },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        email: true,
      },
    });
  }

  async getClassStudents(classId: string) {
    const classStudents = await this.prisma.classStudent.findMany({
      where: { classId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
          },
        },
      },
    });
    return classStudents.map((cs) => cs.student);
  }

  async createCourse(
    teacherId: string,
    schoolId: string,
    dto: CreateCourseDto,
    file?: Express.Multer.File,
  ) {
    const teaches = await this.prisma.teacherSubject.findUnique({
      where: { teacherId_subjectId: { teacherId, subjectId: dto.subjectId } },
    });
    if (!teaches) {
      throw new HttpException(
        'Ви не можете створити курс з предмету, який не викладаєте',
        HttpStatus.FORBIDDEN,
      );
    }

    const classroom = await this.prisma.class.findUnique({
      where: { id: dto.classId },
    });
    if (!classroom || classroom.schoolId !== schoolId) {
      throw new HttpException(
        'Клас не знайдено або він не належить вашій школі',
        HttpStatus.NOT_FOUND,
      );
    }

    let backgroundUrl: string | null = null;
    if (file) {
      backgroundUrl = await this.awsS3Service.uploadFile(file, `courses/backgrounds/${schoolId}`);
    }

    let enrolledStudentIds: string[] = [];

    if (dto.groupName) {
      if (!dto.studentIds || dto.studentIds.length === 0) {
        throw new HttpException(
          'Для створення підгрупи необхідно вибрати хоча б одного учня',
          HttpStatus.BAD_REQUEST,
        );
      }
      enrolledStudentIds = dto.studentIds;
    } else {
      const allClassStudents = await this.prisma.classStudent.findMany({
        where: { classId: dto.classId },
        select: { studentId: true },
      });
      enrolledStudentIds = allClassStudents.map((s) => s.studentId);
    }

    const coTeacherIdsFiltered = dto.coTeacherIds?.filter((id) => id !== teacherId) || [];

    const course = await this.prisma.course.create({
      data: {
        schoolId,
        subjectId: dto.subjectId,
        classId: dto.classId,
        creatorId: teacherId,
        academicYear: dto.academicYear,
        groupName: dto.groupName || null,
        themeColor: dto.themeColor || '#702DFF',
        backgroundUrl: backgroundUrl,

        coTeachers:
          coTeacherIdsFiltered.length > 0
            ? {
                create: coTeacherIdsFiltered.map((id) => ({ teacherId: id })),
              }
            : undefined,

        students:
          enrolledStudentIds.length > 0
            ? {
                create: enrolledStudentIds.map((id) => ({ studentId: id })),
              }
            : undefined,
      },
      include: {
        subject: true,
        class: true,
        coTeachers: true,
        students: true,
      },
    });

    return {
      ...course,
      coTeachers: course.coTeachers.map((ct) => ct.teacherId),
      students: course.students.map((s) => s.studentId),
    };
  }

  async updateCourse(
    teacherId: string,
    courseId: string,
    dto: UpdateCourseDto,
    file?: Express.Multer.File,
  ) {
    const course = await this.ensureCourseCreator(courseId, teacherId);

    let backgroundUrl = course.backgroundUrl;
    if (file) {
      backgroundUrl = await this.awsS3Service.uploadFile(
        file,
        `courses/backgrounds/${course.schoolId}`,
      );
      if (course.backgroundUrl) {
        try {
          await this.awsS3Service.deleteFile(course.backgroundUrl);
        } catch (e) {
          console.error('Помилка видалення старого фону курсу:', e);
        }
      }
    }

    let coTeachersUpdate: any = undefined;
    if (dto.coTeacherIds !== undefined) {
      await this.prisma.courseTeacher.deleteMany({ where: { courseId } });
      const filteredCoTeachers = dto.coTeacherIds.filter((id) => id !== teacherId);
      if (filteredCoTeachers.length > 0) {
        coTeachersUpdate = {
          create: filteredCoTeachers.map((id) => ({ teacherId: id })),
        };
      }
    }

    let studentsUpdate: any = undefined;
    if (dto.studentIds !== undefined || dto.groupName === null) {
      await this.prisma.courseStudent.deleteMany({ where: { courseId } });

      let targetStudentIds: string[] = [];

      if (dto.groupName || (course.groupName && dto.groupName !== null)) {
        targetStudentIds = dto.studentIds || [];
      } else {
        const allClassStudents = await this.prisma.classStudent.findMany({
          where: { classId: course.classId },
          select: { studentId: true },
        });
        targetStudentIds = allClassStudents.map((s) => s.studentId);
      }

      if (targetStudentIds.length > 0) {
        studentsUpdate = {
          create: targetStudentIds.map((id) => ({ studentId: id })),
        };
      }
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id: courseId },
      data: {
        groupName:
          dto.groupName !== undefined
            ? dto.groupName === 'null'
              ? null
              : dto.groupName
            : undefined,
        isArchived: dto.isArchived !== undefined ? dto.isArchived : undefined,
        themeColor: dto.themeColor !== undefined ? dto.themeColor : undefined,
        backgroundUrl: backgroundUrl,
        coTeachers: coTeachersUpdate,
        students: studentsUpdate,
      },
      include: {
        subject: true,
        class: true,
        coTeachers: true,
        students: true,
      },
    });

    return {
      ...updatedCourse,
      coTeachers: updatedCourse.coTeachers.map((ct) => ct.teacherId),
      students: updatedCourse.students.map((s) => s.studentId),
    };
  }

  async deleteCourse(teacherId: string, courseId: string) {
    await this.ensureCourseCreator(courseId, teacherId);
    await this.prisma.course.delete({ where: { id: courseId } });
    return {
      message: "Курс та всі пов'язані з ним матеріали успішно видалено",
    };
  }

  async addCoTeacher(creatorId: string, courseId: string, coTeacherId: string) {
    const course = await this.ensureCourseCreator(courseId, creatorId);

    if (creatorId === coTeacherId)
      throw new HttpException('Ви вже є головним творцем курсу', HttpStatus.BAD_REQUEST);

    const teaches = await this.prisma.teacherSubject.findUnique({
      where: { teacherId_subjectId: { teacherId: coTeacherId, subjectId: course.subjectId } },
    });
    if (!teaches)
      throw new HttpException(
        'Цей вчитель не викладає предмет даного курсу',
        HttpStatus.BAD_REQUEST,
      );

    const exists = await this.prisma.courseTeacher.findUnique({
      where: { courseId_teacherId: { courseId, teacherId: coTeacherId } },
    });
    if (exists) throw new HttpException('Цей вчитель вже є співвикладачем', HttpStatus.BAD_REQUEST);

    await this.prisma.courseTeacher.create({
      data: { courseId, teacherId: coTeacherId },
    });
    return { message: 'Співвикладача успішно додано' };
  }

  async removeCoTeacher(creatorId: string, courseId: string, coTeacherId: string) {
    await this.ensureCourseCreator(courseId, creatorId);
    await this.prisma.courseTeacher.delete({
      where: { courseId_teacherId: { courseId, teacherId: coTeacherId } },
    });
    return { message: 'Співвикладача видалено з курсу' };
  }

  private getCurrentAcademicYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    if (month < 8) {
      return `${year - 1}-${year}`;
    }
    return `${year}-${year + 1}`;
  }

  async getMyStudentCourses(studentId: string, query: GetCoursesQueryDto) {
    const { search, filter, sortBy, sortOrder } = query;
    const currentYear = this.getCurrentAcademicYear();

    const where: any = {
      AND: [{ students: { some: { studentId } } }],
    };

    switch (filter) {
      case 'ARCHIVED':
        where.AND.push({ isArchived: true });
        break;
      case 'PAST':
        where.AND.push({ isArchived: false, academicYear: { lt: currentYear } });
        break;
      case 'IN_PROGRESS':
        where.AND.push({ isArchived: false, academicYear: currentYear });
        break;
      case 'ALL':
      default:
        where.AND.push({ isArchived: false, academicYear: { lte: currentYear } });
        break;
    }

    if (search) {
      where.AND.push({
        OR: [
          { subject: { name: { contains: search, mode: 'insensitive' } } },
          { creator: { lastName: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }

    let orderBy: any = {};
    if (sortBy === 'NAME') {
      orderBy = { subject: { name: sortOrder || 'asc' } };
    } else {
      orderBy = { academicYear: sortOrder || 'desc' };
    }

    return this.prisma.course.findMany({
      where,
      include: {
        subject: true,
        creator: {
          select: { id: true, firstName: true, middleName: true, lastName: true, avatarUrl: true },
        },
        coTeachers: {
          include: {
            teacher: { select: { id: true, firstName: true, middleName: true, lastName: true } },
          },
        },
      },
      orderBy,
    });
  }

  async getMyTeacherCourses(teacherId: string, query: GetCoursesQueryDto) {
    const { search, filter, sortBy, sortOrder } = query;
    const currentYear = this.getCurrentAcademicYear();

    const where: any = {
      AND: [
        {
          OR: [{ creatorId: teacherId }, { coTeachers: { some: { teacherId } } }],
        },
      ],
    };

    switch (filter) {
      case 'ARCHIVED':
        where.AND.push({ isArchived: true });
        break;
      case 'IN_PROGRESS':
        where.AND.push({ isArchived: false, academicYear: currentYear });
        break;
      case 'PLANNED':
        where.AND.push({ isArchived: false, academicYear: { gt: currentYear } });
        break;
      case 'PAST':
        where.AND.push({ isArchived: false, academicYear: { lt: currentYear } });
        break;
      case 'ALL':
      default:
        where.AND.push({ isArchived: false });
        break;
    }

    if (search) {
      where.AND.push({
        OR: [
          { subject: { name: { contains: search, mode: 'insensitive' } } },
          { class: { name: { contains: search, mode: 'insensitive' } } },
          { groupName: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    let orderBy: any = {};
    if (sortBy === 'NAME') {
      orderBy = { subject: { name: sortOrder || 'asc' } };
    } else {
      orderBy = { academicYear: sortOrder || 'desc' };
    }

    return this.prisma.course.findMany({
      where,
      include: {
        subject: true,
        class: {
          include: { homeroomTeacher: { select: { id: true, firstName: true, lastName: true } } },
        },
        _count: { select: { students: true } },
      },
      orderBy,
    });
  }
}
