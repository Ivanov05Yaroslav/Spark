import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateFileMaterialDto, CreateLinkDto, UpdateMaterialDto } from './dto/material.dto';
import { MaterialsService } from './materials.service';

@ApiTags('materials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @ApiOperation({ summary: 'Створити матеріал-ПОСИЛАННЯ (Тільки вчителі курсу)' })
  @Roles('TEACHER')
  @Post('/link')
  async createLink(@GetUser('id') teacherId: string, @Body() dto: CreateLinkDto) {
    return this.materialsService.createLink(teacherId, dto);
  }

  @ApiOperation({ summary: 'Створити матеріал-ФАЙЛ (Тільки вчителі курсу)' })
  @ApiConsumes('multipart/form-data')
  @Roles('TEACHER')
  @Post('/file')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 100 * 1024 * 1024 } }))
  async createFileMaterial(
    @GetUser('id') teacherId: string,
    @Body() dto: CreateFileMaterialDto,
    @UploadedFile() file: any,
  ) {
    return this.materialsService.createFileMaterial(teacherId, dto, file);
  }

  @ApiOperation({ summary: 'Отримати всі матеріали курсу (Для всіх учасників)' })
  @Get('/course/:courseId')
  async getByCourse(@GetUser('id') userId: string, @Param('courseId') courseId: string) {
    return this.materialsService.findAllByCourse(userId, courseId);
  }

  @ApiOperation({ summary: 'Редагувати матеріал/посилання' })
  @Roles('TEACHER')
  @Patch('/:id')
  async update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMaterialDto,
  ) {
    return this.materialsService.update(userId, id, dto);
  }

  @ApiOperation({ summary: 'Видалити матеріал' })
  @Roles('TEACHER')
  @Delete('/:id')
  async delete(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.materialsService.delete(userId, id);
  }
}
