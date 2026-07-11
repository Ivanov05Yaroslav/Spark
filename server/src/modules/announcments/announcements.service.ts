import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AwsS3Service } from '../../core/integrations/aws/aws-s3.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';

@Injectable()
export class AnnouncementsService {
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
        'У вас немає прав для публікації оголошень у цьому курсі',
        HttpStatus.FORBIDDEN,
      );
    }
    return course;
  }

  async create(teacherId: string, dto: CreateAnnouncementDto) {
    const course = await this.verifyTeacherWriteAccess(dto.courseId, teacherId);

    const result = await this.prisma.announcement.create({
      data: {
        courseId: dto.courseId,
        creatorId: teacherId,
        title: dto.title,
        content: dto.content,
        reads: {
          create: {
            userId: teacherId,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
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
      title: 'Нове оголошення',
      content: `У курсі "${courseName}" опубліковано нове оголошення: ${dto.title}`,
      type: 'ANNOUNCEMENT',
      metadata: { courseId: dto.courseId, announcementId: result.id },
    }));
    await this.notificationsService.createMany(notifications);

    return {
      ...result,
      creator: {
        ...result.creator,
        avatarUrl: result.creator.avatarUrl
          ? await this.awsS3Service.generatePresignedUrl(result.creator.avatarUrl)
          : null,
      },
    };
  }

  async findAllByCourse(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        students: true,
        coTeachers: true,
        subject: true,
        class: true,
      },
    });
    if (!course) throw new HttpException('Курс не знайдено', HttpStatus.NOT_FOUND);

    const isCreator = course.creatorId === userId;
    const isCoTeacher = course.coTeachers.some((ct) => ct.teacherId === userId);
    const isStudent = course.students.some((s) => s.studentId === userId);
    const isHomeroom = course.class.homeroomTeacherId === userId;

    if (!isCreator && !isCoTeacher && !isStudent && !isHomeroom) {
      throw new HttpException('Ви не є учасником цього курсу', HttpStatus.FORBIDDEN);
    }

    const announcements = await this.prisma.announcement.findMany({
      where: { courseId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      announcements.map(async (a) => ({
        ...a,
        creator: {
          ...a.creator,
          avatarUrl: a.creator.avatarUrl
            ? await this.awsS3Service.generatePresignedUrl(a.creator.avatarUrl)
            : null,
        },
      })),
    );
  }

  async findOne(userId: string, announcementId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        course: {
          include: {
            students: true,
            coTeachers: true,
            class: true,
          },
        },
      },
    });

    if (!announcement) {
      throw new HttpException('Оголошення не знайдено', HttpStatus.NOT_FOUND);
    }

    const course = announcement.course;
    const isCreator = course.creatorId === userId;
    const isCoTeacher = course.coTeachers.some((ct) => ct.teacherId === userId);
    const isStudent = course.students.some((s) => s.studentId === userId);
    const isHomeroom = course.class.homeroomTeacherId === userId;

    if (!isCreator && !isCoTeacher && !isStudent && !isHomeroom) {
      throw new HttpException('Ви не є учасником цього курсу', HttpStatus.FORBIDDEN);
    }

    const { course: _, ...result } = announcement;
    return {
      ...result,
      creator: {
        ...result.creator,
        avatarUrl: result.creator.avatarUrl
          ? await this.awsS3Service.generatePresignedUrl(result.creator.avatarUrl)
          : null,
      },
    };
  }

  async update(userId: string, announcementId: string, dto: UpdateAnnouncementDto) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    });
    if (!announcement) throw new HttpException('Оголошення не знайдено', HttpStatus.NOT_FOUND);

    if (announcement.creatorId !== userId) {
      throw new HttpException('Ви можете редагувати лише власні оголошення', HttpStatus.FORBIDDEN);
    }

    const updated = await this.prisma.announcement.update({
      where: { id: announcementId },
      data: dto,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      ...updated,
      creator: {
        ...updated.creator,
        avatarUrl: updated.creator.avatarUrl
          ? await this.awsS3Service.generatePresignedUrl(updated.creator.avatarUrl)
          : null,
      },
    };
  }

  async delete(userId: string, announcementId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
      include: { course: true },
    });
    if (!announcement) throw new HttpException('Оголошення не знайдено', HttpStatus.NOT_FOUND);

    if (announcement.creatorId !== userId && announcement.course.creatorId !== userId) {
      throw new HttpException('Ви не можете видалити це оголошення', HttpStatus.FORBIDDEN);
    }

    await this.prisma.announcement.delete({ where: { id: announcementId } });
    return { message: 'Оголошення успішно видалено' };
  }

  async markAsRead(userId: string, announcementId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    });
    if (!announcement) throw new HttpException('Оголошення не знайдено', HttpStatus.NOT_FOUND);

    await this.prisma.announcementRead
      .create({
        data: { announcementId, userId },
      })
      .catch(() => {});

    return { success: true };
  }
}
