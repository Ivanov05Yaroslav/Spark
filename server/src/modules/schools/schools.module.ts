import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service';
import { EdeboSyncService } from '../../core/integrations/edebo/edebo-sync.service';

@Module({
  imports: [HttpModule],
  controllers: [SchoolsController],
  providers: [SchoolsService, EdeboSyncService],
  exports: [SchoolsService],
})
export class SchoolsModule {}