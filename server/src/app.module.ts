import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './core/prisma/prisma.module' // Правильный путь к нашей Prisma
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    PrismaModule,
    // AuthModule, UsersModule and so on
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}