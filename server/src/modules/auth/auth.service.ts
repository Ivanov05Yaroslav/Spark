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
import { DiiaIntegrationService } from '../../core/integrations/diia/diia.service';
import { EmailService } from '../../core/integrations/email/email.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import {
  ChangePasswordDto,
  DiiaCallbackDto,
  ForgotPasswordResetDto,
  ForgotPasswordSendCodeDto,
  ForgotPasswordVerifyCodeDto,
  InitSchoolRegistrationDto,
  LoginUserDto,
  RegisterUserDto,
  SendSchoolEmailCodeDto,
  VerifySchoolEmailCodeDto,
} from './dto/auth.dto';

interface RegistrationSession {
  id: string;
  edeboId: string;
  directorFullNameEdebo: string;
  status: 'INIT' | 'DIIA_VERIFIED' | 'EMAIL_SENT';
  expiresAt: number;
  email?: string;
  passwordHash?: string;
  otpCode?: string;
}

interface PasswordResetSession {
  id: string;
  email: string;
  otpCode: string;
  status: 'INIT' | 'VERIFIED';
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private sessions = new Map<string, RegistrationSession>();
  private passwordResetSessions = new Map<string, PasswordResetSession>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly diiaService: DiiaIntegrationService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterUserDto) {
    const hashPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      ...dto,
      password: hashPassword,
    });
    return this.generateTokens(user);
  }

  async login(dto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        userRoles: {
          include: { role: true },
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
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const userData = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: userData.sub },
        include: {
          userRoles: {
            include: { role: true },
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
        },
      };
    } catch (e) {
      throw new UnauthorizedException('Недійсний або прострочений refresh токен');
    }
  }

  private async generateTokens(user: any) {
    const roles = user.userRoles?.map((ur) => ur.role.name) || [];
    const payload = {
      id: user.id,
      email: user.email,
      roles,
      schoolId: user.schoolId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_ACCESS_SECRET || 'fallback_secret_key',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
      secret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_key',
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, roles, schoolId: user.schoolId },
    };
  }

  async initSchoolRegistration(dto: InitSchoolRegistrationDto) {
    const edeboSchool = await this.prisma.edeboSchool.findUnique({
      where: { edeboId: dto.edeboId },
    });

    if (!edeboSchool) {
      throw new HttpException('Школу не знайдено в локальному реєстрі ЄДЕБО', HttpStatus.NOT_FOUND);
    }

    if (!edeboSchool.directorFullName) {
      throw new HttpException(
        'У реєстрі відсутнє ПІБ директора. Реєстрація неможлива.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingSchool = await this.prisma.school.findFirst({
      where: { edrpou: edeboSchool.edeboId },
    });

    if (existingSchool) {
      throw new HttpException(
        'Цей навчальний заклад вже зареєстровано на платформі',
        HttpStatus.CONFLICT,
      );
    }

    const sessionId = randomUUID();
    this.sessions.set(sessionId, {
      id: sessionId,
      edeboId: dto.edeboId,
      directorFullNameEdebo: edeboSchool.directorFullName,
      status: 'INIT',
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    const diiaAuthUrl = this.diiaService.generateAuthUrl(sessionId);

    return {
      sessionId,
      diiaAuthUrl,
      message: 'Сесію створено. Перенаправте користувача на URL Дії.',
    };
  }

  async processDiiaCallback(dto: DiiaCallbackDto) {
    const session = this.sessions.get(dto.sessionId);

    if (!session) {
      throw new HttpException('Сесію не знайдено або вона прострочена', HttpStatus.NOT_FOUND);
    }
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(dto.sessionId);
      throw new HttpException('Час очікування сесії минув (15 хв)', HttpStatus.BAD_REQUEST);
    }

    try {
      const diiaData = await this.diiaService.getUserDataFromToken(dto.diiaToken);

      const edeboNameNormalized = session.directorFullNameEdebo
        .toLowerCase()
        .replace(/[^а-яіїєґa-z]/g, '');
      const diiaNameNormalized = diiaData.fullName.toLowerCase().replace(/[^а-яіїєґa-z]/g, '');

      // ЄДЕБО: "директорковальовасвітланамихайлівна" містить Дію: "ковальовасвітланамихайлівна"
      if (!edeboNameNormalized.includes(diiaNameNormalized)) {
        this.logger.warn(
          `Спроба реєстрації з невідповідним ПІБ. ЄДЕБО: ${session.directorFullNameEdebo}, Дія: ${diiaData.fullName}`,
        );
        throw new HttpException(
          `Верифікація не пройдена. ПІБ у Дії (${diiaData.fullName}) не збігається з даними ЄДЕБО (${session.directorFullNameEdebo}).`,
          HttpStatus.FORBIDDEN,
        );
      }

      session.status = 'DIIA_VERIFIED';
      this.sessions.set(dto.sessionId, session);

      return {
        success: true,
        message: 'Особу директора успішно підтверджено. Перейдіть до підтвердження email.',
        sessionId: session.id,
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Невідома помилка під час верифікації', HttpStatus.BAD_REQUEST);
    }
  }

  async sendSchoolRegistrationEmailCode(dto: SendSchoolEmailCodeDto) {
    const session = this.sessions.get(dto.sessionId);

    if (!session || (session.status !== 'DIIA_VERIFIED' && session.status !== 'EMAIL_SENT')) {
      throw new HttpException(
        'Невалідна сесія або ви не пройшли верифікацію Дії',
        HttpStatus.FORBIDDEN,
      );
    }

    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (userExists) {
      throw new HttpException('Користувач з таким email вже існує', HttpStatus.CONFLICT);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const passwordHash = await bcrypt.hash(dto.password, 10);

    session.email = dto.email;
    session.passwordHash = passwordHash;
    session.otpCode = otpCode;
    session.status = 'EMAIL_SENT';
    session.expiresAt = Date.now() + 15 * 60 * 1000;
    this.sessions.set(dto.sessionId, session);

    await this.emailService.sendVerificationCode(dto.email, otpCode);

    return { message: 'Код підтвердження відправлено на вашу пошту' };
  }

  async verifySchoolRegistrationEmailCode(dto: VerifySchoolEmailCodeDto) {
    const session = this.sessions.get(dto.sessionId);

    if (!session || session.status !== 'EMAIL_SENT') {
      throw new HttpException(
        'Сесію не знайдено або код ще не відправлено',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (session.otpCode !== dto.code) {
      throw new HttpException('Невірний код підтвердження', HttpStatus.BAD_REQUEST);
    }

    const edeboSchool = await this.prisma.edeboSchool.findUnique({
      where: { edeboId: session.edeboId },
    });
    if (!edeboSchool)
      throw new HttpException(
        'Помилка: школу не знайдено в базі',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    const nameParts = session.directorFullNameEdebo
      .replace(/(Директор|В\.о\.|Керівник)/gi, '')
      .trim()
      .split(' ');
    const lastName = nameParts[0] || 'Невідомо';
    const firstName = nameParts[1] || 'Невідомо';
    const middleName = nameParts[2] || '';

    let adminRole = await this.prisma.role.findUnique({
      where: { name: 'ADMIN' },
    });
    if (!adminRole) {
      adminRole = await this.prisma.role.create({ data: { name: 'ADMIN' } });
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      const newSchool = await prisma.school.create({
        data: {
          name: edeboSchool.fullName,
          edrpou: edeboSchool.edeboId,
          region: edeboSchool.region,
          city: edeboSchool.city,
          isDiiaVerified: true,
        },
      });

      const newDirector = await prisma.user.create({
        data: {
          email: session.email!,
          password: session.passwordHash!,
          firstName,
          lastName,
          middleName,
          isEmailVerified: true,
          lastLoginAt: new Date(),
          schoolId: newSchool.id,
          directedSchool: { connect: { id: newSchool.id } },
          userRoles: {
            create: { roleId: adminRole.id },
          },
        },
        include: { userRoles: { include: { role: true } }, school: true },
      });

      return newDirector;
    });

    this.sessions.delete(dto.sessionId);

    return this.generateTokens(result);
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
