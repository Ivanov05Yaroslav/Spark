import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import 'multer';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminCreateUserDto, GetSchoolUsersDto } from './dto/admin-create-user.dto';
import { AddChildDto } from './dto/manage-children.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SyncRolesDto } from './dto/user-role.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Отримати всіх користувачів' })
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @ApiOperation({
    summary: 'Отримати детальний профіль поточного користувача (вкл. журнал оцінок для учня)',
  })
  @UseGuards(JwtAuthGuard)
  @Get('/profile/me')
  async getMyProfile(@GetUser('id') userId: string) {
    return this.usersService.getMyProfile(userId);
  }

  @ApiOperation({ summary: 'Батьки: Переглянути детальний профіль дитини (вкл. журнал оцінок)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PARENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN')
  @Get('/profile/children/:childId')
  async getChildProfile(@GetUser('id') parentId: string, @Param('childId') childId: string) {
    return this.usersService.getChildProfileForParent(parentId, childId);
  }

  @ApiOperation({ summary: 'Редагувати власний профіль (ПІБ та Аватар)' })
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @Patch('/profile')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file?: any,
  ) {
    return this.usersService.updateProfile(userId, dto, file);
  }

  @ApiOperation({ summary: 'Отримати всіх вчителів своєї школи з їхніми предметами' })
  @UseGuards(JwtAuthGuard)
  @Get('/teachers')
  async getSchoolTeachers(@GetUser('schoolId') schoolId: string) {
    return this.usersService.getSchoolTeachers(schoolId);
  }

  @ApiOperation({
    summary: 'Отримати вчителів своєї школи за конкретним предметом (для співвикладачів)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  @Get('/teachers/by-subject/:subjectId')
  async getTeachersBySubject(
    @GetUser('schoolId') schoolId: string,
    @GetUser('id') currentTeacherId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.usersService.getTeachersBySubject(schoolId, subjectId, currentTeacherId);
  }

  @ApiOperation({ summary: 'Отримати користувача за ID' })
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Отримати всіх користувачів школи з пагінацією (Тільки для Адміна)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('/admin/school-users')
  async getSchoolUsers(@GetUser('id') adminId: string, @Query() query: GetSchoolUsersDto) {
    return this.usersService.getSchoolUsers(adminId, query);
  }

  @ApiOperation({ summary: 'Створити одного користувача (Тільки для Адміна)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('/admin/create')
  async createUserByAdmin(@GetUser('id') adminId: string, @Body() dto: AdminCreateUserDto) {
    return this.usersService.createByAdmin(adminId, dto);
  }

  @ApiOperation({ summary: 'Отримати посилання на CSV шаблон для масового імпорту (з AWS S3)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('/admin/bulk/template')
  async getBulkImportTemplate() {
    const url = await this.usersService.getBulkImportTemplateUrl();
    return { url };
  }

  @ApiOperation({ summary: 'Отримати посилання на PDF-інструкцію для масового імпорту (з AWS S3)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('/admin/bulk/instruction')
  async getBulkImportInstruction() {
    const url = await this.usersService.getBulkImportInstructionUrl();
    return { url };
  }

  @ApiOperation({ summary: 'Масовий імпорт користувачів через CSV файл (Тільки для Адміна)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV файл для імпорту',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('/admin/bulk')
  @UseInterceptors(FileInterceptor('file'))
  async bulkImportByAdmin(
    @GetUser('id') adminId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException('Файл не знайдено', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.bulkImportByAdmin(adminId, file);
  }

  @ApiOperation({ summary: 'Синхронізувати ролі користувача (Тільки для Адміна)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('/admin/:id/roles')
  async syncUserRoles(
    @GetUser('id') adminId: string,
    @Param('id') targetUserId: string,
    @Body() dto: SyncRolesDto,
  ) {
    return this.usersService.syncUserRoles(adminId, targetUserId, dto.roles);
  }

  @ApiOperation({ summary: 'Повністю видалити користувача з системи (Тільки для Адміна)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('/admin/:id')
  async deleteUser(@GetUser('id') adminId: string, @Param('id') targetUserId: string) {
    return this.usersService.deleteUser(adminId, targetUserId);
  }

  @ApiOperation({ summary: 'Додати дитину за кодом' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PARENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN')
  @Post('/me/children')
  @HttpCode(HttpStatus.OK)
  async addChild(@GetUser('id') parentId: string, @Body() dto: AddChildDto) {
    return this.usersService.addChild(parentId, dto.parentsCode);
  }

  @ApiOperation({ summary: "Видалити зв'язок з дитиною (Тільки для батьків)" })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PARENT')
  @Delete('/me/children/:studentId')
  @HttpCode(HttpStatus.OK)
  async removeChild(@GetUser('id') parentId: string, @Param('studentId') studentId: string) {
    return this.usersService.removeChild(parentId, studentId);
  }
}
