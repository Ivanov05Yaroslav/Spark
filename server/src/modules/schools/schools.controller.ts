import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { EdeboSyncService } from '../../core/integrations/edebo/edebo-sync.service';
import { RejectSchoolRequestDto } from './dto/school-requests.dto';
import { GetCitiesDto, GetSchoolsListDto, SearchSchoolByEdeboDto } from './dto/school-search.dto';
import { SchoolsService } from './schools.service';

@ApiTags('schools')
@Controller('schools')
export class SchoolsController {
  constructor(
    private readonly schoolsService: SchoolsService,
    private readonly edeboSyncService: EdeboSyncService,
  ) {}

  @ApiOperation({ summary: 'Отримати список областей України' })
  @Get('regions')
  async getRegions() {
    return this.schoolsService.getRegions();
  }

  @ApiOperation({ summary: 'Отримати список населених пунктів за областю' })
  @Get('cities')
  async getCities(@Query() query: GetCitiesDto) {
    return this.schoolsService.getCities(query.region);
  }

  @ApiOperation({ summary: 'Отримати список шкіл у населеному пункті' })
  @Get('list')
  async getSchoolsList(@Query() query: GetSchoolsListDto) {
    return this.schoolsService.getSchoolsByCity(query.city);
  }

  @ApiOperation({ summary: 'Пошук школи за кодом ЄДЕБО (для початку реєстрації)' })
  @Get('search')
  async searchSchool(@Query() query: SearchSchoolByEdeboDto) {
    return this.schoolsService.searchByEdeboId(query.edeboId);
  }

  // ==========================================
  // МОДЕРАЦІЯ ЗАЯВОК (ТІЛЬКИ ДЛЯ SUPER_ADMIN)
  // ==========================================

  @ApiOperation({ summary: 'Отримати список заявок на реєстрацію школи' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN') // Цю роль має тільки власник платформи
  @Get('/requests/pending')
  async getPendingSchoolRequests() {
    return this.schoolsService.getPendingSchoolRequests();
  }

  @ApiOperation({ summary: 'Схвалити заявку та створити школу' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN')
  @Post('/requests/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveSchoolRequest(@Param('id') requestId: string) {
    return this.schoolsService.approveSchoolRequest(requestId);
  }

  @ApiOperation({ summary: 'Відхилити заявку на реєстрацію школи' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN')
  @Post('/requests/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectSchoolRequest(@Param('id') requestId: string, @Body() dto: RejectSchoolRequestDto) {
    return this.schoolsService.rejectSchoolRequest(requestId, dto.reason);
  }

  // @ApiOperation({ summary: 'ТЕСТОВИЙ ЕНДПОІНТ: Примусово завантажити всі школи з ЄДЕБО в БД' })
  // @Post('force-sync')
  // async forceSync() {
  //   this.edeboSyncService.syncSchoolsFromEdebo();
  //   return { message: 'Синхронізацію запущено у фоновому режимі. Слідкуйте за логами сервера.' };
  // }
}
