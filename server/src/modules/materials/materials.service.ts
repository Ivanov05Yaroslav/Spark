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

  private async getOrCreateModuleId(courseId: string, moduleId?: string, newTitle?: string) {
    if (!moduleId && (!newTitle || newTitle.trim() === '')) {
      throw new HttpException(
        "Матеріал обов'язково має належати до модуля (теми)",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (newTitle && newTitle.trim() !== '') {
      const cleanedTitle = newTitle.trim();
      const existingModule = await this.prisma.courseModule.findFirst({
        where: { courseId, title: { equals: cleanedTitle, mode: 'insensitive' } },
      });

      if (existingModule) {
        return existingModule.id;
      } else {
        const newModule = await this.prisma.courseModule.create({
          data: { courseId, title: cleanedTitle },
        });
        return newModule.id;
      }
    }

    return moduleId as string;
  }

  async createLink(teacherId: string, dto: CreateLinkDto) {
    await this.verifyTeacherWriteAccess(dto.courseId, teacherId);
    const finalModuleId = await this.getOrCreateModuleId(
      dto.courseId,
      dto.courseModuleId,
      dto.newModuleTitle,
    );

    return this.prisma.material.create({
      data: {
        courseId: dto.courseId,
        creatorId: teacherId,
        title: dto.title,
        courseModuleId: finalModuleId,
        linkUrl: dto.linkUrl,
        isHidden: dto.isHidden || false,
      },
    });
  }

  async createFileMaterial(teacherId: string, dto: CreateFileMaterialDto, file: any) {
    if (!file) throw new HttpException("Файл обов'язковий", HttpStatus.BAD_REQUEST);
    await this.verifyTeacherWriteAccess(dto.courseId, teacherId);
    const finalModuleId = await this.getOrCreateModuleId(
      dto.courseId,
      dto.courseModuleId,
      dto.newModuleTitle,
    );

    const fileUrl = await this.awsS3Service.uploadFile(file, `courses/${dto.courseId}/materials`);

    return this.prisma.material.create({
      data: {
        courseId: dto.courseId,
        creatorId: teacherId,
        title: dto.title,
        courseModuleId: finalModuleId,
        fileUrl: fileUrl,
        isHidden: dto.isHidden || false,
      },
    });
  }

  async findOne(userId: string, materialId: string) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: {
        course: { include: { students: true, coTeachers: true, class: true } },
        creator: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        courseModule: { select: { id: true, title: true } },
      },
    });

    if (!material) throw new HttpException('Матеріал не знайдено', HttpStatus.NOT_FOUND);

    const isTeacher =
      material.course.creatorId === userId ||
      material.course.coTeachers.some((ct) => ct.teacherId === userId);
    const isStudent = material.course.students.some((s) => s.studentId === userId);
    const isHomeroom = material.course.class.homeroomTeacherId === userId;

    if (!isTeacher && !isStudent && !isHomeroom) {
      throw new HttpException('Ви не є учасником цього курсу', HttpStatus.FORBIDDEN);
    }
    if (!isTeacher && material.isHidden) {
      throw new HttpException(
        'Доступ до цього матеріалу заборонено (він прихований)',
        HttpStatus.FORBIDDEN,
      );
    }

    let avatarUrl = material.creator.avatarUrl;
    if (avatarUrl && avatarUrl.includes('amazonaws.com')) {
      avatarUrl = await this.awsS3Service.generatePresignedUrl(avatarUrl);
    }

    let signedFileUrl = material.fileUrl;
    if (signedFileUrl && signedFileUrl.includes('amazonaws.com')) {
      signedFileUrl = await this.awsS3Service.generatePresignedUrl(signedFileUrl);
    }

    const { course: _, ...result } = material;
    return {
      ...result,
      fileUrl: signedFileUrl,
      creator: { ...result.creator, avatarUrl },
    };
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

  async update(userId: string, materialId: string, dto: UpdateMaterialDto, file?: any) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: { course: true },
    });
    if (!material) throw new HttpException('Матеріал не знайдено', HttpStatus.NOT_FOUND);
    await this.verifyTeacherWriteAccess(material.courseId, userId);

    const safeLinkUrl =
      dto.linkUrl === 'null' ||
      dto.linkUrl === 'undefined' ||
      !dto.linkUrl ||
      dto.linkUrl.trim() === ''
        ? null
        : dto.linkUrl.trim();

    const isTryingToAddLink = safeLinkUrl !== null;

    const isValidFile = file && file.fieldname && file.size > 0;

    if (
      material.linkUrl &&
      (dto.linkUrl === '' || dto.linkUrl === 'null' || dto.linkUrl === null)
    ) {
      throw new HttpException(
        'Посилання не може бути порожнім. Видаліть матеріал повністю, якщо він більше не потрібен.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (material.fileUrl && isTryingToAddLink) {
      throw new HttpException(
        'Цей матеріал є файлом. Ви не можете замінити його на посилання.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (material.linkUrl && isValidFile) {
      throw new HttpException(
        'Цей матеріал є посиланням. Ви не можете замінити його на файл.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const safeModuleId =
      dto.courseModuleId === 'null' || dto.courseModuleId === 'undefined'
        ? undefined
        : dto.courseModuleId;
    const safeNewTitle =
      dto.newModuleTitle === 'null' || dto.newModuleTitle === 'undefined'
        ? undefined
        : dto.newModuleTitle;

    let finalModuleId = material.courseModuleId;
    if (safeModuleId || safeNewTitle) {
      finalModuleId = await this.getOrCreateModuleId(material.courseId, safeModuleId, safeNewTitle);
    }

    let finalFileUrl = material.fileUrl;

    if (isValidFile) {
      if (material.fileUrl) {
        try {
          await this.awsS3Service.deleteFile(material.fileUrl);
        } catch (e) {
          console.error('Не вдалося видалити старий файл матеріалу з S3:', e);
        }
      }
      finalFileUrl = await this.awsS3Service.uploadFile(
        file,
        `courses/${material.courseId}/materials`,
      );
    }

    const safeIsHidden =
      dto.isHidden === undefined || dto.isHidden === null || String(dto.isHidden) === 'null'
        ? material.isHidden
        : String(dto.isHidden) === 'true';

    return this.prisma.material.update({
      where: { id: materialId },
      data: {
        title: dto.title && dto.title !== 'null' ? dto.title : material.title,
        linkUrl: isTryingToAddLink ? safeLinkUrl : material.linkUrl,
        fileUrl: finalFileUrl,
        courseModuleId: finalModuleId,
        isHidden: safeIsHidden,
      },
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
      try {
        await this.awsS3Service.deleteFile(material.fileUrl);
      } catch (e) {
        console.error('Помилка при видаленні файлу матеріалу з S3:', e);
      }
    }

    await this.prisma.material.delete({ where: { id: materialId } });
    return { message: 'Матеріал успішно видалено' };
  }
}
