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
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Створити завдання (дозволено додавати декілька файлів)' })
  @ApiConsumes('multipart/form-data')
  @Roles('TEACHER')
  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 100 * 1024 * 1024 } }))
  async create(
    @GetUser('id') teacherId: string,
    @Body() dto: CreateTaskDto,
    @UploadedFiles() files: any[],
  ) {
    return this.tasksService.create(teacherId, dto, files);
  }

  @ApiOperation({ summary: 'Отримати всі завдання курсу' })
  @Get('/course/:courseId')
  async getByCourse(@GetUser('id') userId: string, @Param('courseId') courseId: string) {
    return this.tasksService.findAllByCourse(userId, courseId);
  }

  @ApiOperation({ summary: 'Отримати деталі конкретного завдання' })
  @Get('/:id')
  async getOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.tasksService.findOne(userId, id);
  }

  @ApiOperation({ summary: 'Редагувати завдання' })
  @ApiConsumes('multipart/form-data')
  @Roles('TEACHER')
  @Patch('/:id')
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 100 * 1024 * 1024 } }))
  async update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @UploadedFiles() files: any[],
  ) {
    return this.tasksService.update(userId, id, dto, files);
  }

  @ApiOperation({ summary: 'Видалити завдання та його файли (Тільки вчитель)' })
  @Roles('TEACHER')
  @Delete('/:id')
  async delete(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.tasksService.delete(userId, id);
  }
}
