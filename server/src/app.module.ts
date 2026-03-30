import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './core/prisma/prisma.module'
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SchoolsModule } from './modules/schools/schools.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    SchoolsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}