import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import 'multer';
import { AwsS3Service } from '../../core/integrations/aws/aws-s3.service';
import { EmailService } from '../../core/integrations/email/email.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import {
  ChangePasswordDto,
  ForgotPasswordResetDto,
  ForgotPasswordSendCodeDto,
  ForgotPasswordVerifyCodeDto,
  InitParentRegistrationDto,
  InitSchoolRegistrationDto,
  LoginUserDto,
  ParentRegistrationDetailsDto,
  SchoolDirectorDetailsDto,
  VerifyParentEmailDto,
  VerifySchoolEmailDto,
} from './dto';

interface SchoolRegistrationSession {
  id: string;
  edeboId: string;
  status: 'INIT' | 'DETAILS_PROVIDED' | 'EMAIL_VERIFIED';
  expiresAt: number;
  email?: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  otpCode?: string;
}

interface PasswordResetSession {
  id: string;
  email: string;
  otpCode: string;
  status: 'INIT' | 'VERIFIED';
  expiresAt: number;
}

interface ParentRegistrationSession {
  id: string;
  studentIds: string[];
  schoolId: string | null;
  status: 'INIT' | 'DETAILS_PROVIDED';
  expiresAt: number;
  email?: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  otpCode?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private schoolRegistrationSessions = new Map<string, SchoolRegistrationSession>();
  private passwordResetSessions = new Map<string, PasswordResetSession>();
  private parentRegistrationSessions = new Map<string, ParentRegistrationSession>();
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly awsS3Service: AwsS3Service,
    private readonly emailService: EmailService,
  ) {}

  async login(dto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        userRoles: {
          include: { role: true },
        },
        parentRelations: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Невірний email або пароль');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Невірний email або пароль');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        avatarUrl: user.avatarUrl,
        roles: user.userRoles.map((ur) => ur.role.name),
        schoolId: user.schoolId,
        commentsBlockedUntil: user.commentsBlockedUntil,
        children:
          user.parentRelations?.map((rel) => ({
            id: rel.student.id,
            firstName: rel.student.firstName,
            lastName: rel.student.lastName,
            middleName: rel.student.middleName,
          })) || [],
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const userData = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: userData.sub || userData.id },
        include: {
          userRoles: {
            include: { role: true },
          },
          parentRelations: {
            include: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  middleName: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('Користувача не знайдено');
      }

      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          middleName: user.middleName,
          avatarUrl: user.avatarUrl,
          roles: user.userRoles.map((ur) => ur.role.name),
          schoolId: user.schoolId,
          commentsBlockedUntil: user.commentsBlockedUntil,
          children:
            user.parentRelations?.map((rel) => ({
              id: rel.student.id,
              firstName: rel.student.firstName,
              lastName: rel.student.lastName,
              middleName: rel.student.middleName,
            })) || [],
        },
      };
    } catch (e) {
      throw new UnauthorizedException('Недійсний або прострочений refresh токен');
    }
  }

  private async generateTokens(user: any) {
    const roles = user.userRoles?.map((ur) => ur.role.name) || [];
    const children =
      user.parentRelations?.map((rel: any) => ({
        id: rel.student?.id || rel.studentId,
        firstName: rel.student?.firstName || '',
        lastName: rel.student?.lastName || '',
        middleName: rel.student?.middleName || '',
      })) || [];
    const payload = {
      id: user.id,
      email: user.email,
      roles,
      schoolId: user.schoolId,
      children,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
      secret: process.env.JWT_ACCESS_SECRET || 'fallback_secret_key',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
      secret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_key',
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, roles, schoolId: user.schoolId, children },
    };
  }

  // Крок 1: Вибір ЗЗСО
  async initSchoolRegistration(dto: InitSchoolRegistrationDto) {
    const edeboSchool = await this.prisma.edeboSchool.findUnique({
      where: { edeboId: dto.edeboId },
    });
    if (!edeboSchool) {
      throw new HttpException('Школу не знайдено в базі ЄДЕБО', HttpStatus.NOT_FOUND);
    }

    const existingSchool = await this.prisma.school.findUnique({
      where: { edrpou: dto.edeboId },
    });
    if (existingSchool) {
      throw new HttpException('Ця школа вже зареєстрована в системі', HttpStatus.BAD_REQUEST);
    }

    const existingRequest = await this.prisma.schoolRegistrationRequest.findFirst({
      where: { edeboId: dto.edeboId, status: 'PENDING' },
    });
    if (existingRequest) {
      throw new HttpException(
        'Заявка на реєстрацію цієї школи вже розглядається',
        HttpStatus.BAD_REQUEST,
      );
    }

    const sessionId = randomUUID();
    this.schoolRegistrationSessions.set(sessionId, {
      id: sessionId,
      edeboId: dto.edeboId,
      status: 'INIT',
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 хв
    });

    return {
      sessionId,
      message: 'Школу знайдено. Перейдіть до вводу особистих даних.',
      school: edeboSchool,
    };
  }

  // Крок 2: Введення ПІБ, email та пароля
  async provideSchoolDirectorDetails(dto: SchoolDirectorDetailsDto) {
    const session = this.schoolRegistrationSessions.get(dto.sessionId);
    if (!session || session.status !== 'INIT') {
      throw new HttpException('Сесію не знайдено або вона застаріла', HttpStatus.NOT_FOUND);
    }

    const userExists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (userExists) {
      throw new HttpException('Користувач з таким email вже існує', HttpStatus.BAD_REQUEST);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    session.email = dto.email;
    session.passwordHash = await bcrypt.hash(dto.password, 10);
    session.firstName = dto.firstName;
    session.lastName = dto.lastName;
    session.middleName = dto.middleName;
    session.otpCode = otpCode;
    session.status = 'DETAILS_PROVIDED';
    session.expiresAt = Date.now() + 15 * 60 * 1000;

    this.schoolRegistrationSessions.set(dto.sessionId, session);
    await this.emailService.sendVerificationCode(dto.email, otpCode);

    return { sessionId: session.id, message: 'Код підтвердження відправлено на ваш email.' };
  }

  // Крок 3: Перевірка коду
  async verifySchoolDirectorEmail(dto: VerifySchoolEmailDto) {
    const session = this.schoolRegistrationSessions.get(dto.sessionId);
    if (!session || session.status !== 'DETAILS_PROVIDED') {
      throw new HttpException('Сесію не знайдено', HttpStatus.NOT_FOUND);
    }

    if (session.otpCode !== dto.code) {
      throw new HttpException('Невірний код підтвердження', HttpStatus.BAD_REQUEST);
    }

    session.status = 'EMAIL_VERIFIED';
    session.expiresAt = Date.now() + 60 * 60 * 1000;
    this.schoolRegistrationSessions.set(dto.sessionId, session);

    return {
      sessionId: session.id,
      message: 'Email підтверджено. Тепер ви можете завантажити документи.',
    };
  }

  // Крок 2.5: Повторна відправка коду на email¶

  async resendSchoolRegistrationEmailCode(sessionId: string) {
    const session = this.schoolRegistrationSessions.get(sessionId);

    if (!session || session.status !== 'DETAILS_PROVIDED') {
      throw new HttpException(
        'Сесію реєстрації не знайдено або вона застаріла. Почніть спочатку.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!session.email) {
      throw new HttpException('Email ще не був вказаний для цієї сесії', HttpStatus.BAD_REQUEST);
    }

    const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();

    session.otpCode = newOtpCode;
    session.expiresAt = Date.now() + 15 * 60 * 1000;

    this.schoolRegistrationSessions.set(sessionId, session);

    await this.emailService.sendVerificationCode(session.email, newOtpCode);

    return {
      message: 'Новий код підтвердження успішно відправлено на вашу пошту',
      sessionId: sessionId,
    };
  }

  // Крок 4-5: Завантаження файлів і створення заявки
  async submitSchoolRegistrationDocuments(
    sessionId: string,
    files: {
      passportDocs?: any[];
      edrDocs?: any[];
      appointmentOrderDocs?: any[];
      employmentContractDocs?: any[];
    },
  ) {
    const session = this.schoolRegistrationSessions.get(sessionId);

    if (!session || session.status !== 'EMAIL_VERIFIED') {
      throw new HttpException(
        'Сесію не знайдено або email не підтверджено',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!files || !files.passportDocs || files.passportDocs.length === 0) {
      throw new HttpException(
        "Паспорт громадянина України є обов'язковим документом",
        HttpStatus.BAD_REQUEST,
      );
    }

    const uploadCategory = async (fileArray?: any[]) => {
      if (!fileArray || fileArray.length === 0) return [];
      const urls: string[] = [];
      for (const file of fileArray) {
        urls.push(await this.awsS3Service.uploadFile(file, `school-requests/${session.edeboId}`));
      }
      return urls;
    };

    const passportDocsUrls = await uploadCategory(files.passportDocs);
    const edrDocsUrls = await uploadCategory(files.edrDocs);
    const appointmentOrderDocsUrls = await uploadCategory(files.appointmentOrderDocs);
    const employmentContractDocsUrls = await uploadCategory(files.employmentContractDocs);

    await this.prisma.schoolRegistrationRequest.create({
      data: {
        edeboId: session.edeboId,
        email: session.email!,
        passwordHash: session.passwordHash!,
        firstName: session.firstName!,
        lastName: session.lastName!,
        middleName: session.middleName,

        passportDocs: passportDocsUrls,
        edrDocs: edrDocsUrls,
        appointmentOrderDocs: appointmentOrderDocsUrls,
        employmentContractDocs: employmentContractDocsUrls,
      },
    });

    this.schoolRegistrationSessions.delete(sessionId);

    return {
      message:
        'Ваша заявка успішно надіслана на модерацію. Ви отримаєте повідомлення на email після перевірки.',
    };
  }

  async initParentRegistration(dto: InitParentRegistrationDto) {
    const students = await this.prisma.user.findMany({
      where: { parentsCode: { in: dto.childrenCodes } },
    });

    if (students.length !== dto.childrenCodes.length) {
      throw new HttpException(
        'Один або декілька кодів дітей є недійсними або не існують',
        HttpStatus.BAD_REQUEST,
      );
    }

    const sessionId = randomUUID();

    this.parentRegistrationSessions.set(sessionId, {
      id: sessionId,
      studentIds: students.map((s) => s.id),
      schoolId: students[0].schoolId,
      status: 'INIT',
      expiresAt: Date.now() + 30 * 60 * 1000,
    });

    return {
      sessionId,
      message: 'Коди дітей успішно перевірено. Перейдіть до вводу особистих даних.',
      foundChildrenCount: students.length,
    };
  }

  async provideParentDetails(dto: ParentRegistrationDetailsDto) {
    const session = this.parentRegistrationSessions.get(dto.sessionId);

    if (!session || session.status !== 'INIT') {
      throw new HttpException('Сесію не знайдено або вона застаріла', HttpStatus.NOT_FOUND);
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new HttpException('Цей email вже зареєстрований в системі', HttpStatus.BAD_REQUEST);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    session.email = dto.email;
    session.passwordHash = await bcrypt.hash(dto.password, 10);
    session.firstName = dto.firstName;
    session.lastName = dto.lastName;
    session.middleName = dto.middleName;
    session.otpCode = otpCode;
    session.status = 'DETAILS_PROVIDED';
    session.expiresAt = Date.now() + 15 * 60 * 1000;

    this.parentRegistrationSessions.set(dto.sessionId, session);

    await this.emailService.sendVerificationCode(dto.email, otpCode);

    return {
      sessionId: dto.sessionId,
      message: 'Код підтвердження відправлено на вашу електронну пошту.',
    };
  }

  async resendParentRegistrationCode(sessionId: string) {
    const session = this.parentRegistrationSessions.get(sessionId);

    if (!session || session.status !== 'DETAILS_PROVIDED' || !session.email) {
      throw new HttpException('Сесію не знайдено або email не вказано', HttpStatus.NOT_FOUND);
    }

    const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    session.otpCode = newOtpCode;
    session.expiresAt = Date.now() + 15 * 60 * 1000;

    this.parentRegistrationSessions.set(sessionId, session);
    await this.emailService.sendVerificationCode(session.email, newOtpCode);

    return {
      sessionId,
      message: 'Новий код підтвердження успішно відправлено на вашу пошту',
    };
  }

  async verifyParentEmailAndRegister(dto: VerifyParentEmailDto) {
    const session = this.parentRegistrationSessions.get(dto.sessionId);

    if (!session || session.status !== 'DETAILS_PROVIDED') {
      throw new HttpException('Сесію не знайдено', HttpStatus.NOT_FOUND);
    }

    if (session.otpCode !== dto.code) {
      throw new HttpException('Невірний код підтвердження', HttpStatus.BAD_REQUEST);
    }

    const parentRole = await this.prisma.role.findUnique({ where: { name: 'PARENT' } });

    if (!parentRole) {
      throw new HttpException(
        'Роль PARENT не знайдена в системі',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const newParent = await this.prisma.user.create({
      data: {
        email: session.email!,
        password: session.passwordHash!,
        firstName: session.firstName!,
        lastName: session.lastName!,
        middleName: session.middleName,
        schoolId: session.schoolId,
        isEmailVerified: true,
        isPasswordCustom: true,
        userRoles: {
          create: { roleId: parentRole.id },
        },
        parentRelations: {
          create: session.studentIds.map((studentId) => ({
            studentId: studentId,
          })),
        },
      },
      include: {
        userRoles: {
          include: { role: true },
        },
        parentRelations: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
              },
            },
          },
        },
      },
    });

    this.parentRegistrationSessions.delete(dto.sessionId);

    const tokens = await this.generateTokens(newParent);

    return {
      message: 'Реєстрація успішна',
      ...tokens,
      user: {
        id: newParent.id,
        email: newParent.email,
        firstName: newParent.firstName,
        lastName: newParent.lastName,
        middleName: newParent.middleName,
        avatarUrl: newParent.avatarUrl,
        roles: newParent.userRoles.map((ur) => ur.role.name),
        schoolId: newParent.schoolId,
        children:
          newParent.parentRelations?.map((rel) => ({
            id: rel.student.id,
            firstName: rel.student.firstName,
            lastName: rel.student.lastName,
            middleName: rel.student.middleName,
          })) || [],
      },
    };
  }

  async sendPasswordResetCode(dto: ForgotPasswordSendCodeDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new HttpException('Користувача з таким email не знайдено', HttpStatus.NOT_FOUND);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = randomUUID();

    this.passwordResetSessions.set(sessionId, {
      id: sessionId,
      email: dto.email,
      otpCode,
      status: 'INIT',
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    await this.emailService.sendPasswordResetCode(dto.email, otpCode);

    return {
      sessionId,
      message: 'Код для відновлення пароля відправлено на вашу пошту',
    };
  }

  async resendPasswordResetCode(sessionId: string) {
    const session = this.passwordResetSessions.get(sessionId);

    if (!session) {
      throw new HttpException(
        'Сесію реєстрації не знайдено або вона застаріла. Почніть спочатку.',
        HttpStatus.NOT_FOUND,
      );
    }

    const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();

    session.otpCode = newOtpCode;
    session.expiresAt = Date.now() + 15 * 60 * 1000;

    this.passwordResetSessions.set(sessionId, session);

    await this.emailService.sendPasswordResetCode(session.email, newOtpCode);

    return {
      message: 'Новий код для відновлення пароля відправлено на вашу пошту',
      sessionId: sessionId,
    };
  }

  async verifyPasswordResetCode(dto: ForgotPasswordVerifyCodeDto) {
    const session = this.passwordResetSessions.get(dto.sessionId);

    if (!session)
      throw new HttpException('Сесію не знайдено або вона прострочена', HttpStatus.NOT_FOUND);
    if (Date.now() > session.expiresAt) {
      this.passwordResetSessions.delete(dto.sessionId);
      throw new HttpException('Час очікування минув (15 хв)', HttpStatus.BAD_REQUEST);
    }

    if (session.otpCode !== dto.code) {
      throw new HttpException('Невірний код підтвердження', HttpStatus.BAD_REQUEST);
    }

    session.status = 'VERIFIED';
    this.passwordResetSessions.set(dto.sessionId, session);

    return {
      message: 'Код підтверджено. Тепер ви можете ввести новий пароль.',
    };
  }

  async resetPassword(dto: ForgotPasswordResetDto) {
    const session = this.passwordResetSessions.get(dto.sessionId);

    if (!session || session.status !== 'VERIFIED') {
      throw new HttpException(
        'Сесію не знайдено або код не було підтверджено',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { email: session.email },
      data: { password: hashPassword },
    });

    this.passwordResetSessions.delete(dto.sessionId);

    return {
      message: 'Пароль успішно змінено. Тепер ви можете увійти в акаунт.',
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException('Користувача не знайдено', HttpStatus.NOT_FOUND);

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new HttpException('Невірний старий пароль', HttpStatus.BAD_REQUEST);
    }

    const hashPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashPassword },
    });

    return { message: 'Пароль успішно змінено' };
  }
}
