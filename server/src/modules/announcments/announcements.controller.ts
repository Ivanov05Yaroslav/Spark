import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';

@ApiTags('announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @ApiOperation({ summary: 'Створити оголошення (Тільки вчителі курсу)' })
  @Roles('TEACHER')
  @Post()
  async create(@GetUser('id') teacherId: string, @Body() dto: CreateAnnouncementDto) {
    return this.announcementsService.create(teacherId, dto);
  }

  @ApiOperation({ summary: 'Отримати стрічку оголошень курсу (Для всіх учасників)' })
  @Get('/course/:courseId')
  async getByCourse(@GetUser('id') userId: string, @Param('courseId') courseId: string) {
    return this.announcementsService.findAllByCourse(userId, courseId);
  }

  @ApiOperation({ summary: 'Отримати конкретне оголошення за ID (Для всіх учасників)' })
  @Get('/:id')
  async getOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.announcementsService.findOne(userId, id);
  }

  @ApiOperation({ summary: 'Редагувати оголошення' })
  @Roles('TEACHER')
  @Patch('/:id')
  async update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.update(userId, id, dto);
  }

  @ApiOperation({ summary: 'Видалити оголошення' })
  @Roles('TEACHER')
  @Delete('/:id')
  async delete(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.announcementsService.delete(userId, id);
  }

  @ApiOperation({ summary: 'Позначити оголошення як прочитане' })
  @Roles('STUDENT', 'TEACHER', 'PARENT', 'ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @Patch('/:id/read')
  async markAsRead(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.announcementsService.markAsRead(userId, id);
  }
}
