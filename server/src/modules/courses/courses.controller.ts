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
import { RolesGuard } from '../../common/guards/roles.guard';
import { CoursesService } from './courses.service';
import {
  CoTeacherDto,
  CreateCourseDto,
  GetCoursesQueryDto,
  UpdateCourseDto,
} from './dto/course.dto';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @ApiOperation({ summary: 'Отримати всі свої курси (Для УЧНЯ)' })
  @Roles('STUDENT')
  @Get('/student')
  async getMyStudentCourses(@GetUser('id') studentId: string, @Query() query: GetCoursesQueryDto) {
    return this.coursesService.getMyStudentCourses(studentId, query);
  }

  @ApiOperation({ summary: 'Отримати всі свої курси (де я творець або співвикладач)' })
  @Roles('TEACHER')
  @Get('/my')
  async getMyCourses(@GetUser('id') teacherId: string, @Query() query: GetCoursesQueryDto) {
    return this.coursesService.getMyTeacherCourses(teacherId, query);
  }

  @ApiOperation({ summary: 'Створити новий курс' })
  @Roles('TEACHER')
  @Post()
  async createCourse(
    @GetUser('id') teacherId: string,
    @GetUser('schoolId') schoolId: string,
    @Body() dto: CreateCourseDto,
  ) {
    return this.coursesService.createCourse(teacherId, schoolId, dto);
  }

  @ApiOperation({ summary: 'Адміністрування: Редагувати курс / Архівувати' })
  @Roles('TEACHER')
  @Patch('/:id')
  async updateCourse(
    @GetUser('id') teacherId: string,
    @Param('id') courseId: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.updateCourse(teacherId, courseId, dto);
  }

  @ApiOperation({ summary: 'Адміністрування: Видалити курс' })
  @Roles('TEACHER')
  @Delete('/:id')
  async deleteCourse(@GetUser('id') teacherId: string, @Param('id') courseId: string) {
    return this.coursesService.deleteCourse(teacherId, courseId);
  }

  @ApiOperation({ summary: 'Співвикладачі: Додати' })
  @Roles('TEACHER')
  @Post('/:id/co-teachers')
  async addCoTeacher(
    @GetUser('id') teacherId: string,
    @Param('id') courseId: string,
    @Body() dto: CoTeacherDto,
  ) {
    return this.coursesService.addCoTeacher(teacherId, courseId, dto.teacherId);
  }

  @ApiOperation({ summary: 'Співвикладачі: Забрати' })
  @Roles('TEACHER')
  @Delete('/:id/co-teachers/:coTeacherId')
  async removeCoTeacher(
    @GetUser('id') teacherId: string,
    @Param('id') courseId: string,
    @Param('coTeacherId') coTeacherId: string,
  ) {
    return this.coursesService.removeCoTeacher(teacherId, courseId, coTeacherId);
  }
}
