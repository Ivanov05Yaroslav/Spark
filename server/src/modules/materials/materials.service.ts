import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AwsS3Service } from '../../core/integrations/aws/aws-s3.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateFileMaterialDto, CreateLinkDto, UpdateMaterialDto } from './dto/material.dto';

@Injectable()
export class MaterialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  private async verifyTeacherWriteAccess(courseId: string, teacherId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { coTeachers: true },
    });
    if (!course) throw new HttpException('Курс не знайдено', HttpStatus.NOT_FOUND);

    const isCreator = course.creatorId === teacherId;
    const isCoTeacher = course.coTeachers.some((ct) => ct.teacherId === teacherId);

    if (!isCreator && !isCoTeacher) {
      throw new HttpException(
        'У вас немає прав для додавання матеріалів у цей курс',
        HttpStatus.FORBIDDEN,
      );
    }
    return course;
  }

  async createLink(teacherId: string, dto: CreateLinkDto) {
    await this.verifyTeacherWriteAccess(dto.courseId, teacherId);

    return this.prisma.material.create({
      data: {
        courseId: dto.courseId,
        creatorId: teacherId,
        title: dto.title,
        description: dto.description,
        courseModuleId: dto.courseModuleId || null,
        linkUrl: dto.linkUrl,
        isHidden: dto.isHidden || false,
      },
    });
  }

  async createFileMaterial(teacherId: string, dto: CreateFileMaterialDto, file: any) {
    if (!file) throw new HttpException("Файл обов'язковий", HttpStatus.BAD_REQUEST);
    await this.verifyTeacherWriteAccess(dto.courseId, teacherId);

    const fileUrl = await this.awsS3Service.uploadFile(file, `courses/${dto.courseId}/materials`);

    return this.prisma.material.create({
      data: {
        courseId: dto.courseId,
        creatorId: teacherId,
        title: dto.title,
        description: dto.description,
        courseModuleId: dto.courseModuleId || null,
        fileUrl: fileUrl,
        isHidden: dto.isHidden || false,
      },
    });
  }

  async findAllByCourse(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { students: true, coTeachers: true, class: true },
    });
    if (!course) throw new HttpException('Курс не знайдено', HttpStatus.NOT_FOUND);

    const isCreator = course.creatorId === userId;
    const isCoTeacher = course.coTeachers.some((ct) => ct.teacherId === userId);
    const isStudent = course.students.some((s) => s.studentId === userId);
    const isHomeroom = course.class.homeroomTeacherId === userId;

    if (!isCreator && !isCoTeacher && !isStudent && !isHomeroom) {
      throw new HttpException('Ви не є учасником цього курсу', HttpStatus.FORBIDDEN);
    }

    const isTeacher = isCreator || isCoTeacher;

    const whereClause: any = { courseId };
    if (!isTeacher) {
      whereClause.isHidden = false;
    }

    return this.prisma.material.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } },
        courseModule: { select: { id: true, title: true } },
      },
    });
  }

  async update(userId: string, materialId: string, dto: UpdateMaterialDto) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: { course: true },
    });
    if (!material) throw new HttpException('Матеріал не знайдено', HttpStatus.NOT_FOUND);
    await this.verifyTeacherWriteAccess(material.courseId, userId);

    return this.prisma.material.update({
      where: { id: materialId },
      data: dto,
    });
  }

  async delete(userId: string, materialId: string) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: { course: true },
    });
    if (!material) throw new HttpException('Матеріал не знайдено', HttpStatus.NOT_FOUND);

    await this.verifyTeacherWriteAccess(material.courseId, userId);

    if (material.fileUrl) {
      await this.awsS3Service.deleteFile(material.fileUrl);
    }

    await this.prisma.material.delete({ where: { id: materialId } });
    return { message: 'Матеріал успішно видалено' };
  }
}
