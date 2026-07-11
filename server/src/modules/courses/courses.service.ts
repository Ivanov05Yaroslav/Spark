import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import 'multer';
import { AwsS3Service } from '../../core/integrations/aws/aws-s3.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateCourseDto,
  CreateCourseModuleDto,
  GetCoursesQueryDto,
  UpdateCourseDto,
  UpdateCourseModuleDto,
} from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly awsS3Service: AwsS3Service,
    private readonly notificationsService: NotificationsService,
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

  async getCourseById(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true, homeroomTeacher: true } },
        modules: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            semester: true,
            lessons: {
              orderBy: { date: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                date: true,
                nusGroups: { select: { id: true, name: true } },
                materials: {
                  select: {
                    id: true,
                    title: true,
                    fileUrl: true,
                    linkUrl: true,
                    isHidden: true,
                    createdAt: true,
                  },
                },
                task: {
                  select: { id: true, title: true, deadline: true, isHidden: true },
                },
                test: {
                  select: { id: true, title: true, deadline: true, isHidden: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        announcements: {
          orderBy: { createdAt: 'desc' },
          include: {
            creator: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            reads: { where: { userId: userId } },
          },
        },
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

    const signAvatar = async (url: string | null) => {
      if (url && url.includes('amazonaws.com'))
        return await this.awsS3Service.generatePresignedUrl(url);
      return url;
    };

    const creatorAvatar = await signAvatar(course.creator.avatarUrl);
    const creatorClean = {
      id: course.creator.id,
      firstName: course.creator.firstName,
      lastName: course.creator.lastName,
      middleName: course.creator.middleName,
      avatarUrl: creatorAvatar,
      email: course.creator.email,
    };

    const coTeachersClean = await Promise.all(
      course.coTeachers.map(async (ct) => ({
        id: ct.teacher.id,
        firstName: ct.teacher.firstName,
        lastName: ct.teacher.lastName,
        middleName: ct.teacher.middleName,
        avatarUrl: await signAvatar(ct.teacher.avatarUrl),
        email: ct.teacher.email,
      })),
    );
    let homeroomTeacherClean: any = null;
    if (course.class.homeroomTeacher) {
      homeroomTeacherClean = {
        id: course.class.homeroomTeacher.id,
        firstName: course.class.homeroomTeacher.firstName,
        lastName: course.class.homeroomTeacher.lastName,
        middleName: course.class.homeroomTeacher.middleName,
        avatarUrl: await signAvatar(course.class.homeroomTeacher.avatarUrl),
        email: course.class.homeroomTeacher.email,
      };
    }

    const students = await Promise.all(
      course.students.map(async (cs) => ({
        ...cs.student,
        avatarUrl: await signAvatar(cs.student.avatarUrl),
      })),
    );

    const announcements = await Promise.all(
      course.announcements.map(async (ann) => ({
        id: ann.id,
        title: ann.title,
        content: ann.content,
        createdAt: ann.createdAt,
        isNew: ann.reads.length === 0,
        creator: {
          ...ann.creator,
          avatarUrl: await signAvatar(ann.creator.avatarUrl),
        },
      })),
    );
    const unreadAnnouncementsCount = announcements.filter((a) => a.isNew).length;

    const allTasks = course.modules.flatMap((m) => m.lessons.map((l) => l.task).filter(Boolean));
    const allTests = course.modules.flatMap((m) => m.lessons.map((l) => l.test).filter(Boolean));

    const visibleTasks = allTasks.filter((t) => !(t as any).isHidden);
    const visibleTests = allTests.filter((t) => !(t as any).isHidden);

    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const upcomingTasks = visibleTasks
      .filter((t: any) => t.deadline && t.deadline > now && t.deadline <= nextWeek)
      .map((t: any) => ({ ...t, type: 'task' }));

    const upcomingTests = visibleTests
      .filter((t: any) => t.deadline && t.deadline > now && t.deadline <= nextWeek)
      .map((t: any) => ({ ...t, type: 'test' }));

    let unsubmittedWorksCount = 0;
    const isCurrentUserStudent = course.students.some((s) => s.studentId === userId);

    if (isCurrentUserStudent) {
      const visibleTaskIds = visibleTasks.map((t: any) => t.id);
      const visibleTestIds = visibleTests.map((t: any) => t.id);

      const userSubmissions = await this.prisma.submission.findMany({
        where: {
          studentId: userId,
          OR: [{ taskId: { in: visibleTaskIds } }, { testId: { in: visibleTestIds } }],
        },
        select: { taskId: true, testId: true },
      });

      const submittedTaskIds = new Set(userSubmissions.map((s) => s.taskId).filter(Boolean));
      const submittedTestIds = new Set(userSubmissions.map((s) => s.testId).filter(Boolean));

      const unsubmittedTasks = visibleTaskIds.length - submittedTaskIds.size;
      const unsubmittedTests = visibleTestIds.length - submittedTestIds.size;

      unsubmittedWorksCount = Math.max(0, unsubmittedTasks + unsubmittedTests);
    }

    const upcomingDeadlines = [...upcomingTasks, ...upcomingTests].sort(
      (a, b) => a.deadline!.getTime() - b.deadline!.getTime(),
    );

    const formattedModules = await Promise.all(
      course.modules.map(async (mod) => ({
        ...mod,
        lessons: await Promise.all(
          mod.lessons.map(async (lesson) => ({
            ...lesson,
            materials: await Promise.all(
              lesson.materials.map(async (mat) => {
                let signedFileUrl = mat.fileUrl;
                if (signedFileUrl && signedFileUrl.includes('amazonaws.com')) {
                  signedFileUrl = await this.awsS3Service.generatePresignedUrl(signedFileUrl);
                }
                return { ...mat, fileUrl: signedFileUrl };
              }),
            ),
          })),
        ),
      })),
    );

    return {
      id: course.id,
      schoolId: course.schoolId,
      subject: course.subject,
      class: { id: course.class.id, name: course.class.name },
      startDate: course.startDate,
      endDate: course.endDate,
      groupName: course.groupName,
      videoLinks: course.videoLinks,
      themeColor: course.themeColor,
      backgroundUrl: course.backgroundUrl
        ? await this.awsS3Service.generatePresignedUrl(course.backgroundUrl)
        : null,
      isHidden: course.isHidden,
      participants: {
        creator: creatorClean,
        coTeachers: coTeachersClean,
        homeroomTeacher: homeroomTeacherClean,
        students,
        totalStudentsCount: course._count.students,
      },
      modules: formattedModules,
      upcomingDeadlines,
      announcements: [],
      unreadAnnouncementsCount: 0,
      unsubmittedWorksCount,
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

    const now = new Date();
    const courseEndDate = new Date(dto.endDate);
    if (courseEndDate < now) {
      throw new HttpException(
        'Дата закінчення курсу не може бути у минулому. Створення пройдених курсів заборонено.',
        HttpStatus.BAD_REQUEST,
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
        endDate: courseEndDate,
        groupName: dto.groupName || null,
        themeColor: dto.themeColor || '#702DFF',
        backgroundUrl: backgroundUrl,
        videoLinks: dto.videoLinks !== undefined ? dto.videoLinks : undefined,
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

    if (!course.isHidden && enrolledStudentIds.length > 0) {
      const subjectInfo = await this.prisma.subject.findUnique({ where: { id: dto.subjectId } });
      const classInfo = await this.prisma.class.findUnique({ where: { id: dto.classId } });
      const courseName = `${subjectInfo?.name} ${classInfo?.name}`;

      const notifications = enrolledStudentIds.map((studentId) => ({
        senderId: teacherId,
        receiverId: studentId,
        title: 'Новий курс',
        content: `Вас зараховано до нового курсу: "${courseName}".`,
        type: 'COURSE',
        metadata: { courseId: course.id },
      }));
      await this.notificationsService.createMany(notifications);
    }

    return this.getCourseById(teacherId, course.id);
  }

  async updateCourse(
    teacherId: string,
    courseId: string,
    dto: UpdateCourseDto,
    file?: Express.Multer.File,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        school: true,
        students: true,
        coTeachers: true,
        subject: true,
        class: true,
      },
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

    const now = new Date();
    const finalEndDate = dto.endDate ? new Date(dto.endDate) : course.endDate;
    const finalIsArchived = dto.isArchived !== undefined ? dto.isArchived : course.isArchived;
    const finalIsHidden = dto.isHidden !== undefined ? dto.isHidden : course.isHidden;

    if (finalIsArchived === true && finalEndDate >= now) {
      throw new HttpException(
        'Не можна архівувати поточні або майбутні курси (тільки пройдені).',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (finalIsHidden === true && finalEndDate < now) {
      throw new HttpException(
        'Не можна приховувати курси, що вже завершилися.',
        HttpStatus.BAD_REQUEST,
      );
    }

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
    let newCoTeacherIds: string[] = [];

    if (dto.coTeacherIds !== undefined) {
      const existingTeacherIds = course.coTeachers.map((ct) => ct.teacherId);
      const filteredCoTeachers = dto.coTeacherIds.filter((id) => id !== course.creatorId);

      newCoTeacherIds = filteredCoTeachers.filter((id) => !existingTeacherIds.includes(id));

      await this.prisma.courseTeacher.deleteMany({ where: { courseId } });
      if (filteredCoTeachers.length > 0) {
        coTeachersUpdate = { create: filteredCoTeachers.map((id) => ({ teacherId: id })) };
      }
    }

    let studentsUpdate: any = undefined;
    let newStudentIds: string[] = [];

    if (dto.studentIds !== undefined || dto.groupName === null) {
      const existingStudentIds = course.students.map((s) => s.studentId);
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

      newStudentIds = targetStudentIds.filter((id) => !existingStudentIds.includes(id));

      await this.prisma.courseStudent.deleteMany({ where: { courseId } });
      if (targetStudentIds.length > 0) {
        studentsUpdate = { create: targetStudentIds.map((id) => ({ studentId: id })) };
      }
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id: courseId },
      data: {
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        groupName: dto.groupName !== undefined ? dto.groupName : undefined,
        themeColor: dto.themeColor !== undefined ? dto.themeColor : undefined,
        isArchived: dto.isArchived !== undefined ? dto.isArchived : undefined,
        isHidden: dto.isHidden !== undefined ? dto.isHidden : undefined,
        backgroundUrl: backgroundUrl,
        videoLinks: dto.videoLinks !== undefined ? dto.videoLinks : undefined,
        coTeachers: coTeachersUpdate,
        students: studentsUpdate,
      },
    });

    const isNowHidden = dto.isHidden !== undefined ? dto.isHidden : course.isHidden;

    if (!isNowHidden) {
      const courseName = `${course.subject.name} ${course.class.name}`;

      if (newStudentIds.length > 0) {
        const studentNotifications = newStudentIds.map((studentId) => ({
          senderId: teacherId,
          receiverId: studentId,
          title: 'Новий курс',
          content: `Вас зараховано до нового курсу: "${courseName}".`,
          type: 'COURSE',
          metadata: { courseId: updatedCourse.id },
        }));
        await this.notificationsService.createMany(studentNotifications);
      }

      if (newCoTeacherIds.length > 0) {
        const teacherNotifications = newCoTeacherIds.map((newTeacherId) => ({
          senderId: teacherId,
          receiverId: newTeacherId,
          title: 'Призначення співвикладачем',
          content: `Вас призначено співвикладачем у курсі "${courseName}".`,
          type: 'COURSE',
          metadata: { courseId: updatedCourse.id },
        }));
        await this.notificationsService.createMany(teacherNotifications);
      }
    }

    return this.getCourseById(teacherId, courseId);
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

    const courseInfo = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { subject: true, class: true },
    });

    if (courseInfo) {
      const courseName = `${courseInfo.subject.name} ${courseInfo.class.name}`;
      await this.notificationsService.create({
        senderId: teacherId,
        receiverId: targetTeacherId,
        title: 'Призначення співвикладачем',
        content: `Вас призначено співвикладачем у курсі "${courseName}".`,
        type: 'COURSE',
        metadata: { courseId: courseId },
      });
    }

    return this.getCourseById(teacherId, courseId);
  }

  async removeCoTeacher(teacherId: string, courseId: string, targetTeacherId: string) {
    await this.ensureCourseCreator(courseId, teacherId);
    await this.prisma.courseTeacher.delete({
      where: { courseId_teacherId: { courseId, teacherId: targetTeacherId } },
    });
    return this.getCourseById(teacherId, courseId);
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

  async getCourses(userId: string, schoolId: string, query: GetCoursesQueryDto) {
    const {
      search,
      filter,
      sortBy,
      sortOrder,
      roleContext,
      childId,
      isCreator,
      page = 1,
      limit = 8,
    } = query;
    const now = new Date();

    const skip = (page - 1) * limit;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: { include: { role: true } },
        parentRelations: true,
      },
    });

    if (!user) throw new HttpException('Користувача не знайдено', HttpStatus.NOT_FOUND);

    const roles = user.userRoles.map((ur) => ur.role.name);

    let requestedContexts = roles;

    if (roleContext) {
      if (roleContext === 'ADMIN' && !roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
        throw new HttpException('Немає прав адміністратора', HttpStatus.FORBIDDEN);
      }
      if (roleContext !== 'ADMIN' && !roles.includes(roleContext)) {
        throw new HttpException(`У вас немає ролі ${roleContext}`, HttpStatus.FORBIDDEN);
      }
      requestedContexts = [roleContext];
    }

    const isAdminContext =
      requestedContexts.includes('ADMIN') || requestedContexts.includes('SUPER_ADMIN');

    const where: any = {
      schoolId,
      AND: [],
    };

    if (!isAdminContext) {
      const accessOrConditions: any[] = [];

      if (requestedContexts.includes('TEACHER')) {
        if (isCreator) {
          accessOrConditions.push({ creatorId: userId });
        } else {
          accessOrConditions.push({ creatorId: userId });
          accessOrConditions.push({ coTeachers: { some: { teacherId: userId } } });
        }
      }

      if (requestedContexts.includes('STUDENT')) {
        accessOrConditions.push({
          students: { some: { studentId: userId } },
          isHidden: false,
        });
      }

      if (requestedContexts.includes('PARENT')) {
        if (childId) {
          const isMyChild = user.parentRelations.some((rel) => rel.studentId === childId);
          if (!isMyChild) throw new HttpException('Це не ваша дитина', HttpStatus.FORBIDDEN);

          accessOrConditions.push({
            students: { some: { studentId: childId } },
            isHidden: false,
          });
        } else {
          const childrenIds = user.parentRelations.map((rel) => rel.studentId);
          if (childrenIds.length > 0) {
            accessOrConditions.push({
              students: { some: { studentId: { in: childrenIds } } },
              isHidden: false,
            });
          }
        }
      }

      if (accessOrConditions.length === 0) {
        return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
      }

      where.AND.push({ OR: accessOrConditions });
    }

    switch (filter) {
      case 'PAST':
        where.AND.push({
          endDate: { lt: now },
          isArchived: false,
        });
        break;
      case 'ARCHIVED':
        where.AND.push({
          endDate: { lt: now },
          isArchived: true,
        });
        break;
      case 'ACTIVE':
        where.AND.push({
          startDate: { lte: now },
          endDate: { gte: now },
          isHidden: false,
        });
        break;
      case 'UPCOMING':
        where.AND.push({
          startDate: { gt: now },
          isHidden: false,
        });
        break;
      case 'HIDDEN':
        where.AND.push({
          endDate: { gte: now },
          isHidden: true,
        });
        break;
      case 'ALL':
        where.AND.push({
          isHidden: false,
          isArchived: false,
        });
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

    const [total, courses] = await this.prisma.$transaction([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        orderBy,
        include: this.courseListInclude,
        skip,
        take: limit,
      }),
    ]);

    return {
      data: this.formatCourseList(courses),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createModule(teacherId: string, courseId: string, dto: CreateCourseModuleDto) {
    await this.ensureCourseCreator(courseId, teacherId);

    return this.prisma.courseModule.create({
      data: { courseId, title: dto.title, semester: dto.semester },
    });
  }

  async getCourseModules(userId: string, courseId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: { include: { role: true } },
        parentRelations: true,
      },
    });

    if (!user) throw new HttpException('Користувача не знайдено', HttpStatus.NOT_FOUND);

    const roles = user.userRoles.map((ur) => ur.role.name);
    const isAdmin = roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');

    if (!isAdmin) {
      const accessConditions: any[] = [];

      if (roles.includes('TEACHER')) {
        accessConditions.push({ creatorId: userId });
        accessConditions.push({ coTeachers: { some: { teacherId: userId } } });
      }

      if (roles.includes('STUDENT')) {
        accessConditions.push({ students: { some: { studentId: userId } } });
      }

      if (roles.includes('PARENT')) {
        const childrenIds = user.parentRelations.map((rel) => rel.studentId);
        if (childrenIds.length > 0) {
          accessConditions.push({ students: { some: { studentId: { in: childrenIds } } } });
        }
      }

      const courseWithAccess = await this.prisma.course.findFirst({
        where: {
          id: courseId,
          OR: accessConditions.length > 0 ? accessConditions : undefined,
        },
      });

      if (!courseWithAccess) {
        throw new HttpException(
          'Доступ заборонено до матеріалів цього курсу',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    return this.prisma.courseModule.findMany({
      where: { courseId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateModule(teacherId: string, moduleId: string, dto: UpdateCourseModuleDto) {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
    });
    if (!module) throw new HttpException('Модуль не знайдено', HttpStatus.NOT_FOUND);

    await this.ensureCourseCreator(module.courseId, teacherId);

    return this.prisma.courseModule.update({
      where: { id: moduleId },
      data: { title: dto.title, semester: dto.semester },
    });
  }

  async deleteModule(teacherId: string, moduleId: string) {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
    });
    if (!module) throw new HttpException('Модуль не знайдено', HttpStatus.NOT_FOUND);

    await this.ensureCourseCreator(module.courseId, teacherId);

    await this.prisma.courseModule.delete({
      where: { id: moduleId },
    });

    return { message: 'Модуль успішно видалено' };
  }

  async updateVideoLinks(teacherId: string, courseId: string, videoLinks: string[]) {
    await this.ensureCourseCreator(courseId, teacherId);

    await this.prisma.course.update({
      where: { id: courseId },
      data: { videoLinks },
    });

    return this.getCourseById(teacherId, courseId);
  }
}
