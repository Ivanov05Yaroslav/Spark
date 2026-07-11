import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
import { LessonsService } from './lessons.service';

@ApiTags('lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @ApiOperation({
    summary: 'Створити новий урок (Тільки вчитель). Можна передавати файли та лінки',
  })
  @ApiConsumes('multipart/form-data')
  @Roles('TEACHER')
  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 100 * 1024 * 1024 } }))
  async create(
    @GetUser('id') teacherId: string,
    @Body() dto: CreateLessonDto,
    @UploadedFiles() files: any[],
  ) {
    return this.lessonsService.create(teacherId, dto, files);
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

  @ApiOperation({ summary: 'Редагувати урок (Можна додавати/видаляти матеріали)' })
  @ApiConsumes('multipart/form-data')
  @Roles('TEACHER')
  @Patch('/:id')
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 100 * 1024 * 1024 } }))
  async update(
    @GetUser('id') teacherId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
    @UploadedFiles() files: any[],
  ) {
    return this.lessonsService.update(teacherId, id, dto, files);
  }

  @ApiOperation({ summary: 'Видалити урок (та всі пов`язані матеріали, таски і тести з AWS S3)' })
  @Roles('TEACHER')
  @Delete('/:id')
  async delete(@GetUser('id') teacherId: string, @Param('id') id: string) {
    return this.lessonsService.delete(teacherId, id);
  }
}
