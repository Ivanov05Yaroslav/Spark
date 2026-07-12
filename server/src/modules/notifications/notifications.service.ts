import { Injectable } from '@nestjs/common';
import { AwsS3Service } from '../../core/integrations/aws/aws-s3.service';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async create(data: {
    senderId: string;
    receiverId: string;
    title: string;
    content: string;
    type: string;
    metadata?: any;
  }) {
    return this.prisma.notification.create({ data });
  }

  async createMany(notifications: any[]) {
    return this.prisma.notification.createMany({ data: notifications });
  }

  async findAll(userId: string, query: any) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.notification.count({ where: { receiverId: userId } }),
      this.prisma.notification.findMany({
        where: { receiverId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { sender: { select: { firstName: true, lastName: true, avatarUrl: true } } },
      }),
    ]);

    const formattedData = await Promise.all(
      data.map(async (n) => ({
        ...n,
        sender: {
          ...n.sender,
          avatarUrl: n.sender.avatarUrl
            ? await this.awsS3Service.generatePresignedUrl(n.sender.avatarUrl)
            : null,
        },
      })),
    );

    return {
      data: formattedData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(userId: string, id: string) {
    return this.prisma.notification.update({
      where: { id, receiverId: userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { receiverId: userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getCourseParticipants(courseId: string, excludeUserId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        students: { select: { studentId: true } },
        coTeachers: { select: { teacherId: true } },
        class: { select: { homeroomTeacherId: true } },
      },
    });

    if (!course) return [];

    const ids = new Set<string>();
    ids.add(course.creatorId);
    course.coTeachers.forEach((t) => ids.add(t.teacherId));
    course.students.forEach((s) => ids.add(s.studentId));
    if (course.class.homeroomTeacherId) ids.add(course.class.homeroomTeacherId);

    ids.delete(excludeUserId);

    return Array.from(ids);
  }
}
