import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JournalSummaryQueryDto, SaveLessonJournalDto } from './dto/journal.dto';
import { JournalService } from './journals.service';

@ApiTags('journals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses/:courseId/journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @ApiOperation({ summary: 'Отримати список усіх уроків для навігації в журналі (Тільки вчитель)' })
  @Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  @Get('lessons')
  getLessons(@GetUser('id') userId: string, @Param('courseId') courseId: string) {
    return this.journalService.getLessons(userId, courseId);
  }

  @ApiOperation({ summary: 'Отримати поурочний журнал для конкретного уроку (Тільки вчитель)' })
  @Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  @Get('lessons/:lessonId')
  getLessonJournal(
    @GetUser('id') userId: string,
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.journalService.getLessonJournal(userId, courseId, lessonId);
  }

  @ApiOperation({
    summary: 'Зберегти оцінки (НУШ/Традиційні) та відвідуваність за урок (Тільки вчитель)',
  })
  @Roles('TEACHER')
  @Put('lessons/:lessonId')
  saveLessonJournal(
    @GetUser('id') userId: string,
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: SaveLessonJournalDto,
  ) {
    return this.journalService.saveLessonJournal(userId, courseId, lessonId, dto);
  }

  @ApiOperation({
    summary: 'Отримати зведений (тематичний/семестровий) журнал НУШ (Тільки вчитель)',
  })
  @Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  @Get('summary')
  getSummary(
    @GetUser('id') userId: string,
    @Param('courseId') courseId: string,
    @Query() query: JournalSummaryQueryDto,
  ) {
    return this.journalService.getSummary(userId, courseId, query.semester);
  }
}
