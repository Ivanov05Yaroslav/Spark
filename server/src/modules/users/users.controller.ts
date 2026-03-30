import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ManageRoleDto } from './dto/user-role.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Отримати всіх користувачів' })
  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @ApiOperation({ summary: 'Отримати власний профіль' })
  @Get('/profile') 
  async getProfile(@GetUser('id') userId: string) {
    const user = await this.usersService.findById(userId);
    
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }

  @ApiOperation({ summary: 'Редагувати власний профіль (ПІБ та Аватар)' })
  @Patch('/profile')
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() dto: UpdateProfileDto
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @ApiOperation({ summary: 'Отримати користувача за ID' })
  @Get('/:id')
  getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Додати нову роль користувачу' })
  @Post('/:id/roles')
  async addRoleToUser(@Param('id') userId: string, @Body() dto: ManageRoleDto) {
    return this.usersService.addRole(userId, dto.roleName);
  }

  @ApiOperation({ summary: 'Забрати роль у користувача' })
  @Delete('/:id/roles')
  async removeRoleFromUser(
    @Param('id') userId: string,
    @Body() dto: ManageRoleDto,
  ) {
    return this.usersService.removeRole(userId, dto.roleName);
  }
}