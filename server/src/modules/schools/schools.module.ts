import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { EdeboSyncService } from '../../core/integrations/edebo/edebo-sync.service';
import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service';

@Module({
  imports: [HttpModule],
  controllers: [SchoolsController],
  providers: [SchoolsService, EdeboSyncService],
  exports: [SchoolsService],
})
export class SchoolsModule {}
