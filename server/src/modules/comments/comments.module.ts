import { Module } from '@nestjs/common';
import { EmailService } from '../../core/integrations/email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, EmailService, NotificationsService],
  exports: [CommentsService],
})
export class CommentsModule {}
