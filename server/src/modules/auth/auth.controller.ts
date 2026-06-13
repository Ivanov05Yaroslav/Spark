import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import 'multer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgotPasswordResendCodeDto,
  ForgotPasswordResetDto,
  ForgotPasswordSendCodeDto,
  ForgotPasswordVerifyCodeDto,
  InitParentRegistrationDto,
  InitSchoolRegistrationDto,
  LoginUserDto,
  ParentRegistrationDetailsDto,
  ResendParentEmailCodeDto,
  ResendSchoolEmailCodeDto,
  SchoolDirectorDetailsDto,
  SubmitSchoolDocumentsDto,
  VerifyParentEmailDto,
  VerifySchoolEmailDto,
} from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Логін користувача' })
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Оновлення токенів' })
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @ApiOperation({ summary: 'Реєстрація школи Крок 1: Ініціалізація за кодом ЄДЕБО' })
  @Post('/school/register/init')
  @HttpCode(HttpStatus.OK)
  async initSchoolRegistration(@Body() dto: InitSchoolRegistrationDto) {
    return this.authService.initSchoolRegistration(dto);
  }

  @ApiOperation({ summary: 'Реєстрація школи Крок 2: Введення даних директора' })
  @Post('/school/register/details')
  @HttpCode(HttpStatus.OK)
  async provideSchoolDirectorDetails(@Body() dto: SchoolDirectorDetailsDto) {
    return this.authService.provideSchoolDirectorDetails(dto);
  }

  @ApiOperation({
    summary: 'Реєстрація школи Крок 2.5: Повторна відправка коду на email',
  })
  @Post('/school/register/resend-email-code')
  @HttpCode(HttpStatus.OK)
  async resendSchoolEmailCode(@Body() dto: ResendSchoolEmailCodeDto) {
    return this.authService.resendSchoolRegistrationEmailCode(dto.sessionId);
  }

  @ApiOperation({ summary: 'Реєстрація школи Крок 3: Підтвердження email' })
  @Post('/school/register/verify-email')
  @HttpCode(HttpStatus.OK)
  async verifySchoolDirectorEmail(@Body() dto: VerifySchoolEmailDto) {
    return this.authService.verifySchoolDirectorEmail(dto);
  }

  @ApiOperation({
    summary: 'Реєстрація школи Крок 4-5: Завантаження документів та відправка заявки',
  })
  @ApiConsumes('multipart/form-data')
  @Post('/school/register/submit')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'passportDocs', maxCount: 5 },
        { name: 'edrDocs', maxCount: 5 },
        { name: 'appointmentOrderDocs', maxCount: 5 },
        { name: 'employmentContractDocs', maxCount: 5 },
      ],
      { limits: { fileSize: 10 * 1024 * 1024 } },
    ),
  )
  async submitSchoolRegistrationDocuments(
    @Body() dto: SubmitSchoolDocumentsDto,
    @UploadedFiles()
    files: {
      passportDocs?: any[];
      edrDocs?: any[];
      appointmentOrderDocs?: any[];
      employmentContractDocs?: any[];
    },
  ) {
    return this.authService.submitSchoolRegistrationDocuments(dto.sessionId, files);
  }

  @ApiOperation({ summary: 'Реєстрація батьків Етап 1: Введення кодів дітей' })
  @Post('/parent/register/init')
  @HttpCode(HttpStatus.OK)
  async initParentRegistration(@Body() dto: InitParentRegistrationDto) {
    return this.authService.initParentRegistration(dto);
  }

  @ApiOperation({ summary: 'Реєстрація батьків Етап 2: Введення особистих даних батьків' })
  @Post('/parent/register/details')
  @HttpCode(HttpStatus.OK)
  async provideParentDetails(@Body() dto: ParentRegistrationDetailsDto) {
    return this.authService.provideParentDetails(dto);
  }

  @ApiOperation({ summary: 'Реєстрація батьків Етап 3: Перевірка email та створення профілю' })
  @Post('/parent/register/verify')
  @HttpCode(HttpStatus.CREATED)
  async verifyParentRegistration(@Body() dto: VerifyParentEmailDto) {
    return this.authService.verifyParentEmailAndRegister(dto);
  }

  @ApiOperation({ summary: 'Реєстрація батьків Етап 3.5: Повторна відправка коду' })
  @Post('/parent/register/resend-code')
  @HttpCode(HttpStatus.OK)
  async resendParentRegistrationCode(@Body() dto: ResendParentEmailCodeDto) {
    return this.authService.resendParentRegistrationCode(dto.sessionId);
  }

  @ApiOperation({ summary: 'Скидання пароля Крок 1: Відправка коду на email' })
  @Post('/password/forgot/send-code')
  @HttpCode(HttpStatus.OK)
  async forgotPasswordSendCode(@Body() dto: ForgotPasswordSendCodeDto) {
    return this.authService.sendPasswordResetCode(dto);
  }

  @ApiOperation({ summary: 'Скидання пароля Крок 1.5: Повторна відправка коду' })
  @Post('/password/forgot/resend-code')
  @HttpCode(HttpStatus.OK)
  async resendPasswordResetCode(@Body() dto: ForgotPasswordResendCodeDto) {
    return this.authService.resendPasswordResetCode(dto.sessionId);
  }

  @ApiOperation({ summary: 'Скидання пароля Крок 2: Перевірка коду з email' })
  @Post('/password/forgot/verify-code')
  @HttpCode(HttpStatus.OK)
  async forgotPasswordVerifyCode(@Body() dto: ForgotPasswordVerifyCodeDto) {
    return this.authService.verifyPasswordResetCode(dto);
  }

  @ApiOperation({
    summary: 'Скидання пароля Крок 3: Встановлення нового пароля',
  })
  @Post('/password/forgot/reset')
  @HttpCode(HttpStatus.OK)
  async forgotPasswordReset(@Body() dto: ForgotPasswordResetDto) {
    return this.authService.resetPassword(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Зміна пароля (для авторизованих користувачів)' })
  @UseGuards(JwtAuthGuard)
  @Post('/password/change')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req: any) {
    return this.authService.changePassword(req.user.id, dto);
  }
}
