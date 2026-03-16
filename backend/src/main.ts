import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Global prefix: all routes start with /api
  app.setGlobalPrefix('api');

  // Enable CORS for frontend dev server
  app.enableCors({
    origin: ['http://localhost:9000', 'http://localhost:9001', 'http://localhost:9300'],
    credentials: true,
  });

  // Global validation pipe (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = config.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 SENTINNEL Backend running on http://localhost:${port}/api`);
}
bootstrap();
