import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({
    summary:
      'Створити базові ролі (STUDENT, TEACHER, PARENT, MODERATOR, ADMIN)',
  })
  @Post('/init')
  async initRoles() {
    return this.rolesService.initDefaultRoles();
  }

  @ApiOperation({ summary: 'Створити нову кастомну роль' })
  @Post()
  async create(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  @ApiOperation({ summary: 'Отримати всі існуючі ролі' })
  @Get()
  async getAll() {
    return this.rolesService.getAllRoles();
  }

  @ApiOperation({ summary: 'Отримати роль за назвою' })
  @Get('/name/:name')
  async getByName(@Param('name') name: string) {
    return this.rolesService.getRoleByName(name);
  }

  @ApiOperation({ summary: 'Отримати роль за ID' })
  @Get('/:id')
  async getById(@Param('id') id: string) {
    return this.rolesService.getRoleById(id);
  }

  @ApiOperation({ summary: 'Оновити назву ролі' })
  @Put('/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.updateRole(id, dto);
  }

  @ApiOperation({ summary: 'Видалити роль' })
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }
}
