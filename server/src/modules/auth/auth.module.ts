import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { AwsModule } from '../../core/integrations/aws/aws.module';
import { EmailService } from '../../core/integrations/email/email.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({}), AwsModule], 
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailService], 
  exports: [AuthService, JwtModule],
})
export class AuthModule {}