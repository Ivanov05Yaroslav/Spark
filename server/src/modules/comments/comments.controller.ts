import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
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

  @ApiOperation({ summary: "Додати коментар до зданої роботи (Зворотний зв'язок)" })
  @Post()
  async createComment(@GetUser('id') userId: string, @Body() dto: CreateCommentDto) {
    return this.commentsService.createComment(userId, dto);
  }

  @ApiOperation({ summary: 'Отримати історію обговорення зданої роботи' })
  @Get('/submission/:submissionId')
  async getComments(@GetUser('id') userId: string, @Param('submissionId') submissionId: string) {
    return this.commentsService.getCommentsBySubmission(userId, submissionId);
  }

  @ApiOperation({ summary: 'Видалити свій коментар' })
  @Delete('/:id')
  async deleteComment(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.commentsService.deleteComment(userId, id);
  }
}
