import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/comment.dto';

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

  @ApiOperation({ summary: 'Видалити свій коментар' })
  @Delete('/:id')
  async deleteComment(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.commentsService.deleteComment(userId, id);
  }
}
