import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  RegisterUserDto,
  LoginUserDto,
  InitSchoolRegistrationDto,
  DiiaCallbackDto,
  SendSchoolEmailCodeDto,
  VerifySchoolEmailCodeDto,
  ForgotPasswordSendCodeDto,
  ForgotPasswordVerifyCodeDto,
  ForgotPasswordResetDto,
  ChangePasswordDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Реєстрація користувача' })
  @Post('/registration')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

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

  @ApiOperation({
    summary:
      'Реєстрація школи Крок 1: Ініціалізація та генерація посилання на Дію',
  })
  @Post('/school/init')
  @HttpCode(HttpStatus.OK)
  async initSchoolRegistration(@Body() dto: InitSchoolRegistrationDto) {
    return this.authService.initSchoolRegistration(dto);
  }

  @ApiOperation({
    summary:
      'Реєстрація школи Крок 2: Вебхук/Колбек від Дії для верифікації ПІБ',
  })
  @Post('/school/diia-callback')
  @HttpCode(HttpStatus.OK)
  async diiaCallback(@Body() dto: DiiaCallbackDto) {
    return this.authService.processDiiaCallback(dto);
  }

  @ApiOperation({
    summary: 'Реєстрація школи Крок 3: Відправка 6-значного коду на email',
  })
  @Post('/school/send-email-code')
  @HttpCode(HttpStatus.OK)
  async sendSchoolEmailCode(@Body() dto: SendSchoolEmailCodeDto) {
    return this.authService.sendSchoolRegistrationEmailCode(dto);
  }

  @ApiOperation({
    summary: 'Реєстрація школи Крок 4: Перевірка коду та завершення реєстрації',
  })
  @Post('/school/verify-email')
  @HttpCode(HttpStatus.CREATED)
  async verifySchoolEmailCode(@Body() dto: VerifySchoolEmailCodeDto) {
    return this.authService.verifySchoolRegistrationEmailCode(dto);
  }

  @ApiOperation({ summary: 'Скидання пароля Крок 1: Відправка коду на email' })
  @Post('/password/forgot/send-code')
  @HttpCode(HttpStatus.OK)
  async forgotPasswordSendCode(@Body() dto: ForgotPasswordSendCodeDto) {
    return this.authService.sendPasswordResetCode(dto);
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
