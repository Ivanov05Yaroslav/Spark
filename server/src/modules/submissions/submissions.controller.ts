import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { GetSubmissionsQueryDto } from './dto/submission-query.dto';
import {
  CreateTaskSubmissionDto,
  GradeSubmissionDto,
  UpdateTaskSubmissionDto,
} from './dto/submission.dto';
import { SubmissionsService } from './submissions.service';

@ApiTags('submissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @ApiOperation({ summary: 'Здати роботу на завдання (до 10 файлів по 100мб)' })
  @ApiConsumes('multipart/form-data')
  @Roles('STUDENT')
  @Post('/task')
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 100 * 1024 * 1024 } }))
  async submitTask(
    @GetUser('id') studentId: string,
    @Body() dto: CreateTaskSubmissionDto,
    @UploadedFiles() files: any[],
  ) {
    return this.submissionsService.submitTask(studentId, dto, files);
  }

  @ApiOperation({ summary: 'Отримати мою здану роботу для конкретного завдання' })
  @Roles('STUDENT')
  @Get('/task/:taskId/my')
  async getMySubmission(@GetUser('id') studentId: string, @Param('taskId') taskId: string) {
    return this.submissionsService.getMySubmissionForTask(studentId, taskId);
  }

  @ApiOperation({ summary: 'Отримати всі здані роботи до ЗАВДАННЯ (Тільки Вчитель)' })
  @Roles('TEACHER')
  @Get('/task/:taskId/all')
  async getSubmissionsByTask(
    @GetUser('id') teacherId: string,
    @Param('taskId') taskId: string,
    @Query() query: GetSubmissionsQueryDto,
  ) {
    return this.submissionsService.getSubmissionsByTask(teacherId, taskId, query);
  }

  @ApiOperation({ summary: 'Отримати всі здані роботи до ТЕСТУ (Тільки Вчитель)' })
  @Roles('TEACHER')
  @Get('/test/:testId/all')
  async getSubmissionsByTest(
    @GetUser('id') teacherId: string,
    @Param('testId') testId: string,
    @Query() query: GetSubmissionsQueryDto,
  ) {
    return this.submissionsService.getSubmissionsByTest(teacherId, testId, query);
  }

  @ApiOperation({ summary: 'Отримати всі НЕОЦІНЕНІ роботи курсу (Тільки Вчитель)' })
  @Roles('TEACHER')
  @Get('/course/:courseId/ungraded')
  async getUngradedSubmissions(
    @GetUser('id') teacherId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.submissionsService.getUngradedSubmissionsByCourse(teacherId, courseId);
  }

  @ApiOperation({
    summary: 'Отримати всі роботи конкретного учня на курсі (Вчитель або сам Учень)',
  })
  @Roles('TEACHER', 'STUDENT')
  @Get('/course/:courseId/student/:studentId')
  async getStudentSubmissions(
    @GetUser('id') userId: string,
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.submissionsService.getStudentSubmissionsByCourse(userId, courseId, studentId);
  }

  @ApiOperation({ summary: 'Редагувати здану роботу' })
  @ApiConsumes('multipart/form-data')
  @Roles('STUDENT')
  @Patch('/task/:id')
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 100 * 1024 * 1024 } }))
  async updateTaskSubmission(
    @GetUser('id') studentId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskSubmissionDto,
    @UploadedFiles() files: any[],
  ) {
    return this.submissionsService.updateTaskSubmission(studentId, id, dto, files);
  }

  @ApiOperation({ summary: 'Видалити власну роботу (Тільки якщо ще не перевірена)' })
  @Roles('STUDENT')
  @Delete('/:id')
  async deleteSubmission(@GetUser('id') studentId: string, @Param('id') id: string) {
    return this.submissionsService.deleteSubmission(studentId, id);
  }

  @ApiOperation({ summary: 'Оцінити роботу (Тільки Вчитель)' })
  @Roles('TEACHER')
  @Patch('/:id/grade')
  async gradeSubmission(
    @GetUser('id') teacherId: string,
    @Param('id') id: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.submissionsService.gradeSubmission(teacherId, id, dto);
  }

  @ApiOperation({ summary: 'Перегляд деталей спроби тесту' })
  @Roles('TEACHER', 'STUDENT')
  @Get('/test-attempt/:id/review')
  async getTestAttemptReview(@GetUser('id') userId: string, @Param('id') submissionId: string) {
    return this.submissionsService.getTestAttemptReview(userId, submissionId);
  }

  @ApiOperation({ summary: 'Отримати список своїх спроб конкретного тесту' })
  @Roles('STUDENT')
  @Get('/test/:testId/my-attempts')
  async getMyTestAttempts(@GetUser('id') studentId: string, @Param('testId') testId: string) {
    return this.submissionsService.getMyTestAttempts(studentId, testId);
  }

  @ApiOperation({ summary: 'Отримати список учнів з їхніми спробами тесту (Для вчителя)' })
  @Roles('TEACHER')
  @Get('/test/:testId/student-attempts')
  async getStudentAttemptsByTest(
    @GetUser('id') teacherId: string,
    @Param('testId') testId: string,
  ) {
    return this.submissionsService.getStudentAttemptsByTest(teacherId, testId);
  }
}
