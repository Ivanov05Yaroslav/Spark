import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class SchoolsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRegions() {
    const regions = await this.prisma.edeboSchool.findMany({
      select: { region: true },
      distinct: ['region'],
      orderBy: { region: 'asc' },
    });
    return regions.map((r) => r.region).filter(Boolean);
  }

  async getCities(region: string) {
    const cities = await this.prisma.edeboSchool.findMany({
      where: { region },
      select: { city: true },
      distinct: ['city'],
      orderBy: { city: 'asc' },
    });

    if (!cities.length) {
      throw new HttpException('Населені пункти для цієї області не знайдені', HttpStatus.NOT_FOUND);
    }
    return cities.map((c) => c.city).filter(Boolean);
  }

  async getSchoolsByCity(city: string) {
    const schools = await this.prisma.edeboSchool.findMany({
      where: { city, status: 'працює' },
      select: {
        edeboId: true,
        fullName: true,
      },
      orderBy: { fullName: 'asc' },
    });

    if (!schools.length) {
      throw new HttpException('Школи в цьому населеному пункті не знайдені', HttpStatus.NOT_FOUND);
    }
    return schools;
  }

  async searchByEdeboId(edeboId: string) {
    const school = await this.prisma.edeboSchool.findUnique({
      where: { edeboId },
    });

    if (!school) {
      throw new HttpException('Навчальний заклад з таким кодом не знайдено', HttpStatus.NOT_FOUND);
    }

    return school;
  }
}
