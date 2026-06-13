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

  async createCourse(
    teacherId: string,
    schoolId: string,
    dto: CreateCourseDto,
    file?: Express.Multer.File,
  ) {
    const teaches = await this.prisma.teacherSubject.findUnique({
      where: { teacherId_subjectId: { teacherId, subjectId: dto.subjectId } },
    });
    if (!teaches)
      throw new HttpException(
        'Ви не можете створити курс з предмету, який не викладаєте',
        HttpStatus.FORBIDDEN,
      );

    const classroom = await this.prisma.class.findUnique({
      where: { id: dto.classId },
    });
    if (!classroom || classroom.schoolId !== schoolId) {
      throw new HttpException(
        'Клас не знайдено у вашому навчальному закладі',
        HttpStatus.NOT_FOUND,
      );
    }

    const coTeachersData: { teacherId: string }[] = [];
    if (dto.coTeacherIds?.length) {
      const filteredIds = [...new Set(dto.coTeacherIds.filter((id) => id !== teacherId))];

      const validCoTeachersCount = await this.prisma.teacherSubject.count({
        where: {
          subjectId: dto.subjectId,
          teacherId: { in: filteredIds },
        },
      });

      if (validCoTeachersCount !== filteredIds.length) {
        throw new HttpException(
          'Один або декілька обраних співвикладачів не викладають цей предмет. Додавання відхилено.',
          HttpStatus.BAD_REQUEST,
        );
      }

      filteredIds.forEach((id) => coTeachersData.push({ teacherId: id }));
    }

    let backgroundUrl: string | null = null;
    if (file) {
      backgroundUrl = await this.awsS3Service.uploadFile(file, `courses/backgrounds/${schoolId}`);
    }

    const course = await this.prisma.course.create({
      data: {
        schoolId,
        creatorId: teacherId,
        subjectId: dto.subjectId,
        classId: dto.classId,
        academicYear: dto.academicYear,
        groupName: dto.groupName,
        themeColor: dto.themeColor,
        backgroundUrl: backgroundUrl,
        coTeachers: dto.coTeacherIds && dto.coTeacherIds.length > 0
          ? {
              create: dto.coTeacherIds.map((id) => ({ teacherId: id })),
            }
          : undefined,
      },
      include: {
        subject: true,
        class: {
          include: {
            homeroomTeacher: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        coTeachers: {
          include: {
            teacher: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    const classStudents = await this.prisma.classStudent.findMany({
      where: { classId: dto.classId },
    });
    if (classStudents.length > 0) {
      await this.prisma.courseStudent.createMany({
        data: classStudents.map((cs) => ({
          courseId: course.id,
          studentId: cs.studentId,
        })),
      });
    }

    return course;
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
        await this.awsS3Service.deleteFile(course.backgroundUrl);
      }
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id: courseId },
      data: {
        groupName: dto.groupName !== undefined ? dto.groupName : undefined,
        isArchived: dto.isArchived !== undefined ? dto.isArchived : undefined,
        themeColor: dto.themeColor !== undefined ? dto.themeColor : undefined,
        backgroundUrl: backgroundUrl,
      },
      include: {
        subject: true,
        class: true,
      },
    });

    return updatedCourse;
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
