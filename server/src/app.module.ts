import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AwsModule } from './core/integrations/aws/aws.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { AnnouncementsModule } from './modules/announcments/announcements.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClassesModule } from './modules/classes/classes.module';
import { CommentsModule } from './modules/comments/comments.module';
import { CoursesModule } from './modules/courses/courses.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RolesModule } from './modules/roles/roles.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TestsModule } from './modules/tests/tests.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AwsModule,
    AuthModule,
    UsersModule,
    SchoolsModule,
    RolesModule,
    SubjectsModule,
    ClassesModule,
    CoursesModule,
    AnnouncementsModule,
    MaterialsModule,
    TasksModule,
    TestsModule,
    SubmissionsModule,
    CommentsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
