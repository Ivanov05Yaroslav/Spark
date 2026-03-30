import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import cookieParser from 'cookie-parser'
import { SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { config, swaggerPath } from './swagger'

const PORT = process.env.PORT ?? 3000

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')
  app.enableCors({
    credentials: true,
    origin: true,
  })
  app.use(cookieParser())

  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true, 
  }))

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup(swaggerPath, app, document)

  await app.listen(PORT)

  Logger.log(`Server: http://localhost:${PORT}`, 'Bootstrap')
  Logger.log(`Swagger: http://localhost:${PORT}/${swaggerPath}`, 'Bootstrap')
}

bootstrap()