import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EdeboSyncService } from '../../core/integrations/edebo/edebo-sync.service';
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

  @ApiOperation({ summary: 'ТЕСТОВИЙ ЕНДПОІНТ: Примусово завантажити всі школи з ЄДЕБО в БД' })
  @Post('force-sync')
  async forceSync() {
    this.edeboSyncService.syncSchoolsFromEdebo();
    return { message: 'Синхронізацію запущено у фоновому режимі. Слідкуйте за логами сервера.' };
  }
}
