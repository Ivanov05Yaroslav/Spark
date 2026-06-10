import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AwsS3Service } from '../../core/integrations/aws/aws-s3.service';
import { EmailService } from '../../core/integrations/email/email.service';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class SchoolsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

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

  async getPendingSchoolRequests() {
    return this.prisma.schoolRegistrationRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });
  }

  async rejectSchoolRequest(requestId: string, reason: string) {
    const request = await this.prisma.schoolRegistrationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== 'PENDING') {
      throw new HttpException('Заявку не знайдено або вона вже оброблена', HttpStatus.BAD_REQUEST);
    }

    if (request.documents && request.documents.length > 0) {
      for (const docUrl of request.documents) {
        try {
          await this.awsS3Service.deleteFile(docUrl);
        } catch (error) {
          console.error(`Не вдалося видалити файл ${docUrl} з S3:`, error);
        }
      }
    }

    await this.prisma.schoolRegistrationRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED', rejectionReason: reason },
    });

    await this.emailService.sendRejectionEmail(request.email, reason);

    return { message: 'Заявку успішно відхилено, документи видалено з сервера' };
  }

  async approveSchoolRequest(requestId: string) {
    const request = await this.prisma.schoolRegistrationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== 'PENDING') {
      throw new HttpException('Заявку не знайдено або вона вже оброблена', HttpStatus.BAD_REQUEST);
    }

    const edeboSchool = await this.prisma.edeboSchool.findUnique({
      where: { edeboId: request.edeboId },
    });

    if (!edeboSchool) {
      throw new HttpException(
        'Дані про школу не знайдено в реєстрі',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const school = await this.prisma.school.create({
      data: {
        edrpou: edeboSchool.edeboId,
        fullName: edeboSchool.fullName,
        shortName: edeboSchool.shortName,
        region: edeboSchool.region,
        city: edeboSchool.city,
        address: edeboSchool.address,
        phone: edeboSchool.phone,
        website: edeboSchool.website,
        directorFullName: edeboSchool.directorFullName,
      },
    });

    const adminRole = await this.prisma.role.findUnique({ where: { name: 'ADMIN' } });

    const director = await this.prisma.user.create({
      data: {
        email: request.email,
        password: request.passwordHash,
        firstName: request.firstName,
        lastName: request.lastName,
        middleName: request.middleName,
        schoolId: school.id,
        isEmailVerified: true,
        isPasswordCustom: true,
        userRoles: {
          create: { roleId: adminRole!.id },
        },
      },
    });

    await this.prisma.school.update({
      where: { id: school.id },
      data: { directorId: director.id },
    });

    await this.prisma.schoolRegistrationRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' },
    });

    await this.emailService.sendApprovalEmail(request.email);

    return { message: 'Школу та профіль директора успішно створено!' };
  }
}
