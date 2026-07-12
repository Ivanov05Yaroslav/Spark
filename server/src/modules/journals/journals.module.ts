import { Module } from '@nestjs/common';
import { JournalController } from './journals.controller';
import { JournalService } from './journals.service';

@Module({
  controllers: [JournalController],
  providers: [JournalService],
  exports: [JournalService],
})
export class JournalsModule {}
