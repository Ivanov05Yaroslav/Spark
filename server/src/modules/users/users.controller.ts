import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
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
import { AdminCreateUserDto, BulkImportUsersDto } from './dto/admin-create-user.dto';
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

  @ApiOperation({ summary: 'Отримати власний профіль' })
  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@GetUser('id') userId: string) {
    const user = await this.usersService.findById(userId);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
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
  @UseGuards(JwtAuthGuard)
  @Get('/teachers/by-subject/:subjectId')
  async getSchoolTeachersBySubject(
    @GetUser('schoolId') schoolId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.usersService.getSchoolTeachersBySubject(schoolId, subjectId);
  }

  @ApiOperation({ summary: 'Отримати користувача за ID' })
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Створити одного користувача (Тільки для Адміна)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('/admin/create')
  async createUserByAdmin(@GetUser('id') adminId: string, @Body() dto: AdminCreateUserDto) {
    return this.usersService.createByAdmin(adminId, dto);
  }

  @ApiOperation({ summary: 'Масовий імпорт користувачів через JSON (Тільки для Адміна)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('/admin/import')
  async bulkImportUsers(@GetUser('id') adminId: string, @Body() dto: BulkImportUsersDto) {
    return this.usersService.bulkImportByAdmin(adminId, dto.users);
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
}
