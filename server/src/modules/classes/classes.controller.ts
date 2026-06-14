import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ClassesService } from './classes.service';
import {
  AssignHomeroomTeacherDto,
  AssignStudentDto,
  BulkCreateClassDto,
  CreateClassDto,
} from './dto/class.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @ApiOperation({ summary: 'Отримати всі класи своєї школи' })
  @Get()
  async getMySchoolClasses(@GetUser('schoolId') schoolId: string) {
    return this.classesService.findBySchool(schoolId);
  }

  @ApiOperation({ summary: 'Створити один клас' })
  @Post()
  async createClass(@GetUser('schoolId') schoolId: string, @Body() dto: CreateClassDto) {
    return this.classesService.create(schoolId, dto.name);
  }

  @ApiOperation({ summary: 'Масове створення класів (масив назв)' })
  @Post('/bulk')
  async createBulkClasses(@GetUser('schoolId') schoolId: string, @Body() dto: BulkCreateClassDto) {
    return this.classesService.createBulk(schoolId, dto.names);
  }

  @ApiOperation({ summary: 'Додати учня до класу' })
  @Post('/:id/students')
  async addStudent(@Param('id') classId: string, @Body() dto: AssignStudentDto) {
    return this.classesService.addStudent(classId, dto.studentId);
  }

  @ApiOperation({ summary: 'Видалити учня з класу' })
  @Delete('/:id/students/:studentId')
  async removeStudent(@Param('id') classId: string, @Param('studentId') studentId: string) {
    return this.classesService.removeStudent(classId, studentId);
  }

  @ApiOperation({ summary: 'Призначити класного керівника' })
  @Put('/:id/homeroom-teacher')
  async setHomeroomTeacher(@Param('id') classId: string, @Body() dto: AssignHomeroomTeacherDto) {
    return this.classesService.setHomeroomTeacher(classId, dto.teacherId);
  }

  @ApiOperation({ summary: 'Забрати класного керівника' })
  @Delete('/:id/homeroom-teacher')
  async removeHomeroomTeacher(@Param('id') classId: string) {
    return this.classesService.removeHomeroomTeacher(classId);
  }

  @ApiOperation({ summary: 'Отримати список усіх учнів класу' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  @Get('/:id/students')
  async getClassStudents(@Param('id') classId: string) {
    return this.classesService.getClassStudents(classId);
  }
}
