import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
import { LessonsService } from './lessons.service';

@ApiTags('lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @ApiOperation({
    summary: 'Створити новий урок (Тільки вчитель).',
  })
  @Roles('TEACHER')
  @Post()
  async create(@GetUser('id') teacherId: string, @Body() dto: CreateLessonDto) {
    return this.lessonsService.create(teacherId, dto);
  }

  @ApiOperation({ summary: 'Отримати всі уроки курсу' })
  @Get('/course/:courseId')
  async getByCourse(@GetUser('id') userId: string, @Param('courseId') courseId: string) {
    return this.lessonsService.findAllByCourse(userId, courseId);
  }

  @ApiOperation({ summary: 'Отримати деталі конкретного уроку' })
  @Get('/:id')
  async getOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.lessonsService.findOne(userId, id);
  }

  @ApiOperation({ summary: 'Редагувати урок' })
  @Roles('TEACHER')
  @Patch('/:id')
  async update(
    @GetUser('id') teacherId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(teacherId, id, dto);
  }

  @ApiOperation({ summary: 'Видалити урок (та всі пов`язані таски і тести з AWS S3)' })
  @Roles('TEACHER')
  @Delete('/:id')
  async delete(@GetUser('id') teacherId: string, @Param('id') id: string) {
    return this.lessonsService.delete(teacherId, id);
  }
}
