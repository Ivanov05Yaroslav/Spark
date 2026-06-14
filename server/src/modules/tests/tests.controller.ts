import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  BulkCreateQuestionDto,
  CreateQuestionDto,
  CreateTestDto,
  SubmitTestDto,
  UpdateQuestionDto,
  UpdateTestDto,
} from './dto/test.dto';
import { TestsService } from './tests.service';

@ApiTags('tests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @ApiOperation({ summary: 'Створити оболонку тесту (Тільки вчитель)' })
  @Roles('TEACHER')
  @Post()
  async createTest(@GetUser('id') teacherId: string, @Body() dto: CreateTestDto) {
    return this.testsService.createTest(teacherId, dto);
  }

  @ApiOperation({ summary: 'Отримати всі тести курсу (Список)' })
  @Get('/course/:courseId')
  async getByCourse(@GetUser('id') userId: string, @Param('courseId') courseId: string) {
    return this.testsService.findAllByCourse(userId, courseId);
  }

  @ApiOperation({
    summary: 'Отримати деталі тесту з питаннями (Учню відповіді приходять без isCorrect)',
  })
  @Get('/:id')
  async getTestDetails(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.testsService.getTestDetails(userId, id);
  }

  @ApiOperation({ summary: 'Редагувати налаштування тесту' })
  @Roles('TEACHER')
  @Patch('/:id')
  async updateTest(
    @GetUser('id') teacherId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTestDto,
  ) {
    return this.testsService.updateTest(teacherId, id, dto);
  }

  @ApiOperation({ summary: 'Видалити тест' })
  @Roles('TEACHER')
  @Delete('/:id')
  async deleteTest(@GetUser('id') teacherId: string, @Param('id') id: string) {
    return this.testsService.deleteTest(teacherId, id);
  }

  @ApiOperation({ summary: 'Додати питання до тесту' })
  @Roles('TEACHER')
  @Post('/:id/questions')
  async addQuestion(
    @GetUser('id') teacherId: string,
    @Param('id') testId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.testsService.addQuestion(teacherId, testId, dto);
  }

  @ApiOperation({ summary: 'МАСОВО додати багато питань до тесту' })
  @Roles('TEACHER')
  @Post('/:id/questions/bulk')
  async addQuestionsBulk(
    @GetUser('id') teacherId: string,
    @Param('id') testId: string,
    @Body() dto: BulkCreateQuestionDto,
  ) {
    return this.testsService.addQuestionsBulk(teacherId, testId, dto);
  }

  @ApiOperation({ summary: 'Редагувати існуюче питання (текст, бали, або масив відповідей)' })
  @Roles('TEACHER')
  @Patch('/:testId/questions/:questionId')
  async updateQuestion(
    @GetUser('id') teacherId: string,
    @Param('testId') testId: string,
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.testsService.updateQuestion(teacherId, testId, questionId, dto);
  }

  @ApiOperation({ summary: 'Видалити питання з тесту' })
  @Roles('TEACHER')
  @Delete('/:testId/questions/:questionId')
  async deleteQuestion(
    @GetUser('id') teacherId: string,
    @Param('testId') testId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.testsService.deleteQuestion(teacherId, testId, questionId);
  }

  @ApiOperation({ summary: 'Здати тест (Тільки Учень). Оцінка виставляється автоматично' })
  @Roles('STUDENT')
  @Post('/:id/submit')
  async submitTest(
    @GetUser('id') studentId: string,
    @Param('id') id: string,
    @Body() dto: SubmitTestDto,
  ) {
    return this.testsService.submitTest(studentId, id, dto);
  }
}
