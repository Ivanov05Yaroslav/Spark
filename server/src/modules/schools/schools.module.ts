import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { EdeboSyncService } from '../../core/integrations/edebo/edebo-sync.service';
import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service';
import { EmailService } from '../../core/integrations/email/email.service';
import { AwsModule } from '../../core/integrations/aws/aws.module';

@Module({
  imports: [HttpModule, AwsModule],
  controllers: [SchoolsController],
  providers: [SchoolsService, EdeboSyncService, EmailService],
  exports: [SchoolsService],
})
export class SchoolsModule {}