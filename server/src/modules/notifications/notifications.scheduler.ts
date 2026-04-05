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
  }

  private async processReminders(days: number, timeLabel: string) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const tasks = await this.prisma.task.findMany({
      where: { deadline: { gte: startOfDay, lte: endOfDay }, isHidden: false },
      include: { course: { include: { students: true } } },
    });

    const tests = await this.prisma.test.findMany({
      where: { deadline: { gte: startOfDay, lte: endOfDay }, isHidden: false },
      include: { course: { include: { students: true } } },
    });

    for (const item of [...tasks, ...tests]) {
      const students = item.course?.students || [];
      if (students.length === 0) continue;

      const notifications = students.map((s) => ({
        senderId: item.creatorId,
        receiverId: s.studentId,
        title: `Нагадування про дедлайн`,
        content: `Нагадуємо, що термін здачі "${item.title}" спливає ${timeLabel}!`,
        type: 'REMINDER',
      }));

      await this.notificationsService.createMany(notifications);
    }
  }
}
