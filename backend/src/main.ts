import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Global prefix: all routes start with /api
  app.setGlobalPrefix('api');

  // Helmet security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc:   ["'self'", "'unsafe-inline'"],
        scriptSrc:  ["'self'"],
        imgSrc:     ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // ── CORS actualizado: exponer Content-Disposition para descargas ──
  app.enableCors({
    origin:       [config.get('FRONTEND_URL') || 'http://localhost:9000', 'http://localhost:9001', 'http://localhost:9002'],
    credentials:  true,
    // CRÍTICO: sin este header Axios no puede leer el filename del archivo
    // al hacer responseType: 'blob' en las descargas de documentos y deploy.
    exposedHeaders: ['Content-Disposition'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:            true,
      forbidNonWhitelisted: true,
      transform:            true,
    }),
  );

  const port = config.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 SENTINNEL Backend running on http://localhost:${port}/api`);
  console.log(`🔌 WebSocket namespace: ws://localhost:${port}/chat_sm_vc`);
}
bootstrap();