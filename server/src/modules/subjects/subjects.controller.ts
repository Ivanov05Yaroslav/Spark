import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AssignSubjectDto, CreateSubjectDto } from './dto/subject.dto';
import { SubjectsService } from './subjects.service';

@ApiTags('subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @ApiOperation({ summary: 'Ініціалізація базових предметів НУШ' })
  @Post('/init-nus')
  async initNus() {
    return this.subjectsService.initNusSubjects();
  }

  @ApiOperation({ summary: 'Отримати всі предмети' })
  @Get()
  async getAll() {
    return this.subjectsService.findAll();
  }

  @ApiOperation({ summary: 'Створити кастомний предмет' })
  @Post()
  async create(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(dto.name);
  }

  @ApiOperation({ summary: 'Видалити предмет' })
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return this.subjectsService.delete(id);
  }

  @ApiOperation({ summary: 'Призначити предмет вчителю' })
  @Post('/assign')
  async assign(@Body() dto: AssignSubjectDto) {
    return this.subjectsService.assignToTeacher(dto.teacherId, dto.subjectId);
  }

  @ApiOperation({ summary: 'Забрати предмет у вчителя' })
  @Delete('/assign/:teacherId/:subjectId')
  async removeAssign(@Param('teacherId') teacherId: string, @Param('subjectId') subjectId: string) {
    return this.subjectsService.removeFromTeacher(teacherId, subjectId);
  }

  @ApiOperation({ summary: 'Ініціалізація базових груп результатів НУШ' })
  @Post('/init-nus-groups')
  async initNusGroups() {
    return this.subjectsService.initNusGroups();
  }

  @ApiOperation({ summary: 'Отримати групи результатів НУШ для конкретного предмету' })
  @Get('/:subjectId/nus-groups')
  async getNusGroups(@Param('subjectId') subjectId: string) {
    return this.subjectsService.getNusGroupsBySubject(subjectId);
  }
}
