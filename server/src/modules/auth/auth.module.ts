import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { DiiaIntegrationService } from '../../core/integrations/diia/diia.service';
import { EmailService } from '../../core/integrations/email/email.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, DiiaIntegrationService, EmailService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
