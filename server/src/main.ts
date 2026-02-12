import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create(AppModule, {
    logger: isProduction
      ? ['error', 'warn']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  // CORS configuration - 使用 origin 函数进行安全验证
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:3002');
  const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // 允许没有 origin 的请求（如移动应用、Postman 等）
      if (!origin) return callback(null, true);

      // 移除端口号进行统一比较
      const originWithoutPort = origin.replace(/:\d+$/, '');
      const allowedWithoutPorts = allowedOrigins.map(o => o.replace(/:\d+$/, ''));

      if (allowedWithoutPorts.includes(originWithoutPort) || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours
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
      .setTitle('TrendMonitor API')
      .setDescription('TrendMonitor - Hot Search Monitor Backend API')
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
  }

  // Start server
  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  if (swaggerEnabled) {
    console.log(`📚 Swagger documentation available at: http://localhost:${port}/docs`);
  }

  console.log(`
🔍 TrendMonitor Backend API
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
