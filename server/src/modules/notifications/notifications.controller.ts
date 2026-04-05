import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetNotificationsQueryDto } from './dto/notification-query.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Отримати список моїх сповіщень' })
  @Get()
  async getAll(@GetUser('id') userId: string, @Query() query: GetNotificationsQueryDto) {
    return this.notificationsService.findAll(userId, query);
  }

  @ApiOperation({ summary: 'Прочитати всі сповіщення' })
  @Patch('/read-all')
  async readAll(@GetUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @ApiOperation({ summary: 'Прочитати конкретне сповіщення' })
  @Patch('/:id/read')
  async readOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.notificationsService.markAsRead(userId, id);
  }
}
