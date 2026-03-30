import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto, LoginUserDto, InitSchoolRegistrationDto, DiiaCallbackDto, SendSchoolEmailCodeDto, VerifySchoolEmailCodeDto } from './dto/auth.dto';
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

  @ApiOperation({ summary: 'Реєстрація школи Крок 1: Ініціалізація та генерація посилання на Дію' })
  @Post('/school/init')
  @HttpCode(HttpStatus.OK)
  async initSchoolRegistration(@Body() dto: InitSchoolRegistrationDto) {
    return this.authService.initSchoolRegistration(dto);
  }

  @ApiOperation({ summary: 'Реєстрація школи Крок 2: Вебхук/Колбек від Дії для верифікації ПІБ' })
  @Post('/school/diia-callback')
  @HttpCode(HttpStatus.OK)
  async diiaCallback(@Body() dto: DiiaCallbackDto) {
    return this.authService.processDiiaCallback(dto);
  }

  @ApiOperation({ summary: 'Реєстрація школи Крок 3: Відправка 6-значного коду на email' })
  @Post('/school/send-email-code')
  @HttpCode(HttpStatus.OK)
  async sendSchoolEmailCode(@Body() dto: SendSchoolEmailCodeDto) {
    return this.authService.sendSchoolRegistrationEmailCode(dto);
  }

  @ApiOperation({ summary: 'Реєстрація школи Крок 4: Перевірка коду та завершення реєстрації' })
  @Post('/school/verify-email')
  @HttpCode(HttpStatus.CREATED)
  async verifySchoolEmailCode(@Body() dto: VerifySchoolEmailCodeDto) {
    return this.authService.verifySchoolRegistrationEmailCode(dto);
  }
}