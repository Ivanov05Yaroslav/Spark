import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleDeadlineReminders() {
    this.logger.log('Запуск перевірки дедлайнів...');
    await this.processReminders(7, 'рівно через тиждень');
    await this.processReminders(1, 'вже завтра');
    await this.processOverdue();
  }

  private async processOverdue() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

    const overdueTasks = await this.prisma.task.findMany({
      where: { deadline: { gte: startOfYesterday, lte: endOfYesterday }, isHidden: false },
      include: { course: { include: { students: true, subject: true, class: true } } },
    });

    for (const task of overdueTasks) {
      const students = task.course?.students || [];
      for (const studentRecord of students) {
        const studentId = studentRecord.studentId;

        const submission = await this.prisma.submission.findFirst({
          where: { taskId: task.id, studentId: studentId },
        });

        const courseName = `${task.course.subject.name} ${task.course.class.name}`;

        if (!submission) {
          await this.notificationsService.create({
            senderId: task.creatorId,
            receiverId: studentId,
            title: 'Прострочене завдання',
            content: `Ви прострочили завдання: "${task.title}" у курсі "${courseName}".`,
            type: 'DEADLINE',
            metadata: { courseId: task.courseId, taskId: task.id },
          });

          const parents = await this.prisma.studentParent.findMany({
            where: { studentId },
            include: { student: true },
          });

          for (const parentRel of parents) {
            await this.notificationsService.create({
              senderId: task.creatorId,
              receiverId: parentRel.parentId,
              title: 'Прострочене завдання у дитини',
              content: `Ваша дитина (${parentRel.student.firstName}) має прострочене завдання: "${task.title}" у курсі "${courseName}".`,
              type: 'DEADLINE',
              metadata: { courseId: task.courseId, taskId: task.id, studentId: studentId },
            });
          }
        }
      }
    }
  }

  private async processReminders(days: number, timeLabel: string) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const tasks = await this.prisma.task.findMany({
      where: { deadline: { gte: startOfDay, lte: endOfDay }, isHidden: false },
      include: { course: { include: { students: true, subject: true, class: true } } },
    });

    const tests = await this.prisma.test.findMany({
      where: { deadline: { gte: startOfDay, lte: endOfDay }, isHidden: false },
      include: { course: { include: { students: true, subject: true, class: true } } },
    });

    for (const item of [...tasks, ...tests]) {
      const students = item.course?.students || [];
      if (students.length === 0) continue;

      const courseName = `${item.course.subject.name} ${item.course.class.name}`;

      const notifications = students.map((s) => ({
        senderId: item.creatorId,
        receiverId: s.studentId,
        title: 'Нагадування про дедлайн',
        content: `Дедлайн для "${item.title}" у курсі "${courseName}" настає ${timeLabel}!`,
        type: 'DEADLINE',
        metadata: {
          courseId: item.courseId,
          taskId: (item as any).attachments ? item.id : undefined,
          testId: (item as any).timeLimitMinutes !== undefined ? item.id : undefined,
        },
      }));

      await this.notificationsService.createMany(notifications);
    }
  }
}
