import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import {
  CreateCommentDto,
  GetReportsQueryDto,
  ReportCommentDto,
  ResolveReportDto,
  UpdateCommentDto,
} from './dto/comment.dto';

@ApiTags('comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Додати коментар (до завдання або тесту)' })
  @Post()
  async createComment(@GetUser('id') userId: string, @Body() dto: CreateCommentDto) {
    return this.commentsService.createComment(userId, dto);
  }

  @ApiOperation({ summary: 'Отримати приватні коментарі до завдання (Task)' })
  @Get('/task/:id')
  async getTaskComments(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Query('targetStudentId') targetStudentId?: string,
  ) {
    return this.commentsService.getComments(userId, 'task', id, targetStudentId);
  }

  @ApiOperation({ summary: 'Отримати приватні коментарі до тесту (Test)' })
  @Get('/test/:id')
  async getTestComments(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Query('targetStudentId') targetStudentId?: string,
  ) {
    return this.commentsService.getComments(userId, 'test', id, targetStudentId);
  }

  @ApiOperation({ summary: 'Редагувати свій коментар' })
  @Patch('/:id')
  async updateComment(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(userId, id, dto);
  }

  @ApiOperation({ summary: 'Видалити свій коментар' })
  @Delete('/:id')
  async deleteComment(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.commentsService.deleteComment(userId, id);
  }

  @ApiOperation({ summary: 'Поскаржитися на коментар' })
  @Post('/:id/report')
  async reportComment(
    @GetUser('id') userId: string,
    @Param('id') commentId: string,
    @Body() dto: ReportCommentDto,
  ) {
    return this.commentsService.reportComment(userId, commentId, dto);
  }

  @ApiOperation({ summary: 'Отримати список скарг на коментарі з пагінацією та пошуком' })
  @Roles('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('/reports/list')
  async getReports(@GetUser('id') moderatorId: string, @Query() query: GetReportsQueryDto) {
    return this.commentsService.getReports(moderatorId, query);
  }

  @ApiOperation({ summary: 'Ухвалити рішення по скарзі (Схвалити/Відхилити/Заблокувати)' })
  @Roles('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
  @Patch('/reports/:reportId/resolve')
  async resolveReport(
    @GetUser('id') moderatorId: string,
    @Param('reportId') reportId: string,
    @Body() dto: ResolveReportDto,
  ) {
    return this.commentsService.resolveReport(moderatorId, reportId, dto);
  }
}
