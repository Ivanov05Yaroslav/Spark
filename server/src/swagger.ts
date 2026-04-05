import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerPath = 'api/docs';

export const config = new DocumentBuilder()
  .setTitle('Spark API')
  .setDescription('Документація API для освітньої платформи')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
