import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EdeboSyncService {
  private readonly logger = new Logger(EdeboSyncService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async syncSchoolsFromEdebo() {
    this.logger.log('Початок синхронізації ЗЗСО з ЄДЕБО...');

    try {
      const { data } = await firstValueFrom(
        this.httpService.get('https://registry.edbo.gov.ua/api/institutions/?ut=3&exp=json'),
      );

      if (!data || !Array.isArray(data)) {
        throw new Error('Недійсний формат даних від ЄДЕБО');
      }

      this.logger.log(`Отримано ${data.length} закладів. Зберігаємо в базу...`);

      let updatedCount = 0;
      const chunkSize = 100;

      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);

        await Promise.all(
          chunk.map(async (school) => {
            if (!school.institution_id) return;

            const edeboId = String(school.institution_id);
            const city = school.koatuu_name || school.katottgname || 'Не вказано';
            const region = school.region_name || 'Не вказано';

            const schoolData = {
              fullName: school.institution_name,
              shortName: school.short_name,
              isChecked: school.is_checked,
              status: school.state_name,
              institutionType: school.institution_type_name,
              financingType: school.university_financing_type_name,
              koatuuId: school.koatuu_id,
              region: region,
              koatuuName: school.koatuu_name,
              address: school.address,
              katottgCode: school.katottgcode,
              katottgName: school.katottgname,
              parentInstitutionId: school.parent_institution_id
                ? String(school.parent_institution_id)
                : null,
              governanceName: school.governance_name,
              phone: school.phone,
              fax: school.fax,
              email: school.email,
              website: school.website,
              directorFullName: school.boss,
              isSupport: school.support_name,
              isVillage: school.is_village,
              isMountain: school.is_mountain,
              isInternat: school.is_internat,
              approvedCount: school.approved_count ? String(school.approved_count) : null,
              city: city,
            };

            try {
              await this.prisma.edeboSchool.upsert({
                where: { edeboId },
                update: schoolData,
                create: {
                  edeboId: edeboId,
                  ...schoolData,
                },
              });
              updatedCount++;
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : String(err);
              this.logger.warn(`Помилка запису школи ${edeboId}: ${message}`);
            }
          }),
        );
      }

      this.logger.log(`Синхронізацію завершено. Оновлено/Створено записів: ${updatedCount}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('Помилка під час синхронізації з ЄДЕБО', message);
    }
  }
}
