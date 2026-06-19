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
      include: { school: true },
    });
    if (!course) throw new HttpException('Курс не знайдено', HttpStatus.NOT_FOUND);

    const user = await this.prisma.user.findUnique({
      where: { id: teacherId },
      include: { userRoles: { include: { role: true } } },
    });
    const isAdmin = user?.userRoles.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r.role.name));

    if (course.creatorId !== teacherId && !isAdmin) {
      throw new HttpException(
        'Тільки творець курсу або адміністратор може виконувати цю дію',
        HttpStatus.FORBIDDEN,
      );
    }
    return course;
  }

  private get courseListInclude() {
    return {
      subject: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          avatarUrl: true,
        },
      },
      coTeachers: {
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              middleName: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: { select: { students: true } },
    };
  }

  private formatCourseList(courses: any[]) {
    return courses.map((course) => ({
      ...course,
      coTeachers: course.coTeachers.map((ct: any) => ct.teacher),
    }));
  }

  async getCourseById(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            avatarUrl: true,
            email: true,
          },
        },
        coTeachers: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
                avatarUrl: true,
                email: true,
              },
            },
          },
        },
        students: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { student: { lastName: 'asc' } },
        },
        _count: { select: { students: true } },
      },
    });

    if (!course) {
      throw new HttpException('Курс не знайдено', HttpStatus.NOT_FOUND);
    }

    return {
      ...course,
      coTeachers: course.coTeachers.map((ct) => ct.teacher),
      students: course.students.map((cs) => cs.student),
    };
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
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        groupName: dto.groupName || null,
        themeColor: dto.themeColor || '#702DFF',
        backgroundUrl: backgroundUrl,
        isHidden: dto.isHidden !== undefined ? dto.isHidden : false,
        coTeachers:
          coTeacherIdsFiltered.length > 0
            ? { create: coTeacherIdsFiltered.map((id) => ({ teacherId: id })) }
            : undefined,
        students:
          enrolledStudentIds.length > 0
            ? { create: enrolledStudentIds.map((id) => ({ studentId: id })) }
            : undefined,
      },
    });

    return this.getCourseById(course.id);
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
      const filteredCoTeachers = dto.coTeacherIds.filter((id) => id !== course.creatorId);
      if (filteredCoTeachers.length > 0) {
        coTeachersUpdate = { create: filteredCoTeachers.map((id) => ({ teacherId: id })) };
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
        studentsUpdate = { create: targetStudentIds.map((id) => ({ studentId: id })) };
      }
    }

    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        groupName:
          dto.groupName !== undefined
            ? dto.groupName === 'null'
              ? null
              : dto.groupName
            : undefined,
        isArchived: dto.isArchived !== undefined ? dto.isArchived : undefined,
        isHidden: dto.isHidden !== undefined ? dto.isHidden : undefined,
        themeColor: dto.themeColor !== undefined ? dto.themeColor : undefined,
        backgroundUrl: backgroundUrl,
        coTeachers: coTeachersUpdate,
        students: studentsUpdate,
      },
    });

    return this.getCourseById(courseId);
  }

  async deleteCourse(userId: string, courseId: string) {
    const course = await this.ensureCourseCreator(courseId, userId);

    if (course.backgroundUrl) {
      try {
        await this.awsS3Service.deleteFile(course.backgroundUrl);
      } catch (e) {
        console.error('Помилка видалення фону курсу:', e);
      }
    }

    await this.prisma.course.delete({ where: { id: courseId } });
    return { message: 'Курс успішно видалено' };
  }

  async addCoTeacher(teacherId: string, courseId: string, targetTeacherId: string) {
    await this.ensureCourseCreator(courseId, teacherId);
    if (teacherId === targetTeacherId) {
      throw new HttpException('Ви не можете додати себе як співвикладача', HttpStatus.BAD_REQUEST);
    }
    const existing = await this.prisma.courseTeacher.findUnique({
      where: { courseId_teacherId: { courseId, teacherId: targetTeacherId } },
    });
    if (existing) {
      throw new HttpException('Цей вчитель вже є співвикладачем', HttpStatus.BAD_REQUEST);
    }
    await this.prisma.courseTeacher.create({
      data: { courseId, teacherId: targetTeacherId },
    });
    return this.getCourseById(courseId);
  }

  async removeCoTeacher(teacherId: string, courseId: string, targetTeacherId: string) {
    await this.ensureCourseCreator(courseId, teacherId);
    await this.prisma.courseTeacher.delete({
      where: { courseId_teacherId: { courseId, teacherId: targetTeacherId } },
    });
    return this.getCourseById(courseId);
  }

  // private getCurrentAcademicYear(): string {
  //   const now = new Date();
  //   const year = now.getFullYear();
  //   const month = now.getMonth() + 1;

  //   if (month < 8) {
  //     return `${year - 1}-${year}`;
  //   }
  //   return `${year}-${year + 1}`;
  // }

  async getMyStudentCourses(studentId: string, query: GetCoursesQueryDto) {
    const { search, filter, sortBy, sortOrder } = query;
    const now = new Date();

    const where: any = {
      students: { some: { studentId } },
      isHidden: false,
      AND: [],
    };

    switch (filter) {
      case 'ARCHIVED':
        where.AND.push({
          OR: [{ isArchived: true }, { endDate: { lt: now } }],
        });
        break;
      case 'IN_PROGRESS':
        where.AND.push({
          isArchived: false,
          startDate: { lte: now },
          endDate: { gte: now },
        });
        break;
      case 'PLANNED':
        where.AND.push({
          isArchived: false,
          startDate: { gt: now },
        });
        break;
      // case 'PAST':
      //   where.AND.push({ isArchived: false, endDate: { lt: now } });
      //   break;
      case 'ALL':
      default:
        where.AND.push({
          isArchived: false,
          endDate: { gte: now },
        });
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
      orderBy = { startDate: sortOrder || 'desc' };
    }

    const courses = await this.prisma.course.findMany({
      where,
      orderBy,
      include: this.courseListInclude,
    });

    return this.formatCourseList(courses);
  }

  async getMyTeacherCourses(teacherId: string, query: GetCoursesQueryDto) {
    const { search, filter, sortBy, sortOrder } = query;
    const now = new Date();

    const where: any = {
      OR: [{ creatorId: teacherId }, { coTeachers: { some: { teacherId } } }],
      AND: [],
    };

    switch (filter) {
      case 'ARCHIVED':
        where.AND.push({
          OR: [{ isArchived: true }, { endDate: { lt: now } }],
        });
        break;
      case 'IN_PROGRESS':
        where.AND.push({
          isArchived: false,
          startDate: { lte: now },
          endDate: { gte: now },
        });
        break;
      case 'PLANNED':
        where.AND.push({
          isArchived: false,
          startDate: { gt: now },
        });
        break;
      // case 'PAST':
      //   where.AND.push({ isArchived: false, endDate: { lt: now } });
      //   break;
      case 'ALL':
      default:
        where.AND.push({
          isArchived: false,
          endDate: { gte: now },
        });
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
      orderBy = { startDate: sortOrder || 'desc' };
    }

    const courses = await this.prisma.course.findMany({
      where,
      orderBy,
      include: this.courseListInclude,
    });

    return this.formatCourseList(courses);
  }

  async getAllSchoolCourses(schoolId: string, query: GetCoursesQueryDto) {
    const { search, filter, sortBy, sortOrder } = query;
    const now = new Date();

    const where: any = {
      schoolId,
      AND: [],
    };

    switch (filter) {
      case 'ARCHIVED':
        where.AND.push({
          OR: [
            { isArchived: true },
            { endDate: { lt: now } },
          ],
        });
        break;
      case 'IN_PROGRESS':
        where.AND.push({
          isArchived: false,
          startDate: { lte: now },
          endDate: { gte: now },
        });
        break;
      case 'PLANNED':
        where.AND.push({ 
          isArchived: false, 
          startDate: { gt: now } 
        });
        break;
      // case 'PAST':
      //   where.AND.push({ isArchived: false, endDate: { lt: now } });
      //   break;
      case 'ALL':
      default:
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
      orderBy = { startDate: sortOrder || 'desc' };
    }

    const courses = await this.prisma.course.findMany({
      where,
      orderBy,
      include: this.courseListInclude,
    });

    return this.formatCourseList(courses);
  }
}
