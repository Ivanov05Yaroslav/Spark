import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import 'multer';
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

  @ApiOperation({ summary: 'Створити курс' })
  @Roles('TEACHER')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('backgroundImage'))
  @Post('/')
  async createCourse(
    @GetUser('id') teacherId: string,
    @GetUser('schoolId') schoolId: string,
    @Body() dto: CreateCourseDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.coursesService.createCourse(teacherId, schoolId, dto, file);
  }

  @ApiOperation({ summary: 'Отримати курси (Універсальний список залежно від ролі)' })
  @Roles('STUDENT', 'TEACHER', 'PARENT', 'ADMIN', 'SUPER_ADMIN')
  @Get('/')
  async getCourses(
    @GetUser('id') userId: string,
    @GetUser('schoolId') schoolId: string,
    @Query() query: GetCoursesQueryDto,
  ) {
    return this.coursesService.getCourses(userId, schoolId, query);
  }

  @ApiOperation({ summary: 'Отримати повну інформацію про конкретний курс за ID' })
  @Roles('STUDENT', 'TEACHER', 'PARENT', 'ADMIN', 'SUPER_ADMIN')
  @Get('/:id')
  async getCourseById(@Param('id') courseId: string) {
    return this.coursesService.getCourseById(courseId);
  }

  @ApiOperation({ summary: 'Адміністрування: Редагувати курс / Архівувати' })
  @Roles('TEACHER')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('backgroundImage'))
  @Put('/:id')
  async updateCourse(
    @GetUser('id') teacherId: string,
    @Param('id') courseId: string,
    @Body() dto: UpdateCourseDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.coursesService.updateCourse(teacherId, courseId, dto, file);
  }

  @ApiOperation({ summary: 'Адміністрування: Видалити курс' })
  @Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  @Delete('/:id')
  async deleteCourse(@GetUser('id') userId: string, @Param('id') courseId: string) {
    return this.coursesService.deleteCourse(userId, courseId);
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

  @ApiOperation({ summary: 'Співвикладачі: Видалити' })
  @Roles('TEACHER')
  @Delete('/:id/co-teachers/:coTeacherId')
  async removeCoTeacher(
    @GetUser('id') teacherId: string,
    @Param('id') courseId: string,
    @Param('coTeacherId') targetTeacherId: string,
  ) {
    return this.coursesService.removeCoTeacher(teacherId, courseId, targetTeacherId);
  }
}