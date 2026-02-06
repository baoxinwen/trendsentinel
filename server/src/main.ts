import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  // CORS configuration
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-API-Key',
  });

  // Compression
  app.use(compression());

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const swaggerEnabled = configService.get<boolean>('SWAGGER_ENABLED', true);

  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('TrendSentinel API')
      .setDescription('热搜哨兵 - Hot Search Monitor Backend API')
      .setVersion('1.0')
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API Key for authentication (required for config and email endpoints)',
        },
        'api-key',
      )
      .addTag('config', 'Email configuration management')
      .addTag('hotsearch', 'Hot search data retrieval')
      .addTag('email', 'Email sending operations')
      .addTag('scheduler', 'Scheduled job management')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
    });

    console.log(`📚 Swagger documentation available at: http://localhost:${await app.getUrl()}/docs`);
  }

  // Start server
  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  console.log(`
🔍 热搜哨兵 (TrendSentinel) Backend API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Environment: ${configService.get<string>('NODE_ENV', 'development')}
  Port: ${port}
  API Prefix: /${apiPrefix}
  CORS: ${corsOrigin}
  Swagger: ${swaggerEnabled ? 'Enabled' : 'Disabled'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

bootstrap();
