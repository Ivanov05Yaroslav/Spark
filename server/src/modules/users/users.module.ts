import { Module } from '@nestjs/common';
import { ClassesModule } from '../classes/classes.module';
import { RolesModule } from '../roles/roles.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { EmailService } from '../../core/integrations/email/email.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [RolesModule, ClassesModule, SubjectsModule],
  controllers: [UsersController],
  providers: [UsersService, EmailService],
  exports: [UsersService],
})
export class UsersModule {}
